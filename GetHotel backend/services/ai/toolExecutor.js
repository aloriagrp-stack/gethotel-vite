const { TOOL_NAMES } = require('./decisionEngine');
const { searchHotelsInDatabase, fetchHotelsByIds } = require('./hotelSearchService');
const { searchHourlyStays } = require('./hourlyStayService');
const { searchFlights } = require('./flightSearchService');
const { generateIndiaTourPackage } = require('./indiaTourPlanner');
const logger = require('./logger');

/**
 * Executes deterministic business/data tools. The LLM only sees these results.
 *
 * @param {{ decision: { toolName: string }, messages: Array, memory: object }} params
 * @returns {Promise<{ toolName: string, status: string, hotels: Array, flights?: Object, tourPackage?: Object, error?: string }>}
 */
async function executeTool({ decision, messages, memory }) {
    if (!decision || decision.toolName === TOOL_NAMES.NONE) {
        return {
            toolName: TOOL_NAMES.NONE,
            status: 'none',
            hotels: []
        };
    }

    if (decision.toolName === TOOL_NAMES.HOURLY_STAY_SEARCH) {
        try {
            const lastQuery = (messages && messages.length > 0) ? (messages[messages.length - 1].content || messages[messages.length - 1].text || '') : '';
            const matchDuration = lastQuery.match(/(\d+)\s*(?:hr|hour|ghant)/i);
            const durationHrs = matchDuration ? parseInt(matchDuration[1]) : 3;
            const city = memory?.destination || null;

            const hotels = await searchHourlyStays({ city, durationHrs });
            return { toolName: TOOL_NAMES.HOURLY_STAY_SEARCH, status: hotels.length > 0 ? 'success' : 'no_results', hotels };
        } catch (err) {
            logger.error('ToolExecutor', 'HOURLY_STAY_SEARCH failed', { error: err.message });
            return { toolName: TOOL_NAMES.HOURLY_STAY_SEARCH, status: 'error', hotels: [], error: err.message };
        }
    }

    if (decision.toolName === TOOL_NAMES.FLIGHT_SEARCH) {
        try {
            const lastQuery = (messages && messages.length > 0) ? (messages[messages.length - 1].content || messages[messages.length - 1].text || '') : '';
            
            // Extract origin & destination from current query OR history (e.g. "Germany to Delhi")
            let origin = 'Delhi';
            let destination = 'Mumbai';

            const allTexts = (messages || []).map(m => m.content || m.text || '').reverse();
            for (const text of allTexts) {
                const routeMatch = text.match(/([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)/i);
                if (routeMatch) {
                    const rawOrigin = routeMatch[1].replace(/flight|flights|cheapest|sasti|show|me|cards?/gi, '').trim();
                    const rawDest = routeMatch[2].replace(/flight|flights|ticket|tickets|cards?|show/gi, '').trim();
                    if (rawOrigin.length > 1 && rawDest.length > 1) {
                        origin = rawOrigin;
                        destination = rawDest;
                        break;
                    }
                }
            }

            const flightResult = await searchFlights({ origin, destination });
            return { toolName: TOOL_NAMES.FLIGHT_SEARCH, status: 'success', hotels: [], flights: flightResult };
        } catch (err) {
            logger.error('ToolExecutor', 'FLIGHT_SEARCH failed', { error: err.message });
            return { toolName: TOOL_NAMES.FLIGHT_SEARCH, status: 'error', hotels: [], error: err.message };
        }
    }

    if (decision.toolName === TOOL_NAMES.INDIA_TOUR_PLANNER) {
        try {
            const lastQuery = (messages && messages.length > 0) ? (messages[messages.length - 1].content || messages[messages.length - 1].text || '') : '';
            const allText = (messages || []).map(m => m.content || m.text || '').join(' ');
            
            // Extract destination & days
            let destination = memory?.destination || 'Goa';
            const matchDays = lastQuery.match(/(\d+)\s*(?:day|days|dino|din)/i) || allText.match(/(\d+)\s*(?:day|days|dino|din)/i);
            const durationDays = matchDays ? parseInt(matchDays[1]) : 5;

            // Check Golden Triangle or custom route
            if (/golden\s*triangle|delhi.*agra|agra.*jaipur/i.test(allText)) {
                destination = 'Golden Triangle (Delhi - Agra - Jaipur)';
            } else {
                const destMatch = lastQuery.match(/(?:to|in|for)\s+([a-zA-Z\s]+)(?:\s+\d+\s+day|\s+tour|\s+package|$)/i);
                if (destMatch) {
                    destination = destMatch[1].trim();
                }
            }

            // Extract budget amount (e.g. 50000, 50k, 50,000)
            let budget = 50000;
            const matchBudgetK = allText.match(/(\d+)\s*k\b/i);
            const matchBudgetNum = allText.match(/(\d{4,6})/);
            if (matchBudgetK) {
                budget = parseInt(matchBudgetK[1]) * 1000;
            } else if (matchBudgetNum) {
                budget = parseInt(matchBudgetNum[1]);
            }

            // Pass full query text so detectGeographicConflict can inspect all locations (e.g. Shimla + Taj Mahal)
            const tourResult = await generateIndiaTourPackage({ destination: allText || destination, durationDays, budget });
            return { toolName: TOOL_NAMES.INDIA_TOUR_PLANNER, status: 'success', hotels: [], tourPackage: tourResult };
        } catch (err) {
            logger.error('ToolExecutor', 'INDIA_TOUR_PLANNER failed', { error: err.message });
            return { toolName: TOOL_NAMES.INDIA_TOUR_PLANNER, status: 'error', hotels: [], error: err.message };
        }
    }

    if (decision.toolName === TOOL_NAMES.HOTEL_SEARCH) {
        try {
            const result = await searchHotelsInDatabase(messages);
            const hotels = Array.isArray(result) ? result : (result.hotels || []);
            const status = result.status || (hotels.length > 0 ? 'success' : 'no_results');
            return { toolName: TOOL_NAMES.HOTEL_SEARCH, status, hotels, error: result.error };
        } catch (err) {
            logger.error('ToolExecutor', 'HOTEL_SEARCH failed unexpectedly', { error: err.message });
            return { toolName: TOOL_NAMES.HOTEL_SEARCH, status: 'error', hotels: [], error: err.message };
        }
    }

    if (decision.toolName === TOOL_NAMES.ROOM_SEARCH) {
        try {
            let selectedHotelId = memory?.selectedHotelId;
            if (!selectedHotelId && Array.isArray(messages)) {
                for (let i = messages.length - 1; i >= 0; i--) {
                    const content = messages[i].content || messages[i].text || '';

                    const matchUrl = content.match(/\/hotel\/(\d+)/);
                    if (matchUrl) { selectedHotelId = parseInt(matchUrl[1]); break; }

                    const matchId = content.match(/\b(?:id|hotelid)\s*[:=]?\s*(\d+)/i);
                    if (matchId) { selectedHotelId = parseInt(matchId[1]); break; }

                    const matchParen = content.match(/\((\d+)\)/);
                    if (matchParen) { selectedHotelId = parseInt(matchParen[1]); break; }
                }
            }

            let hotels = [];
            let status = 'no_results';

            if (selectedHotelId) {
                const fetched = await fetchHotelsByIds([selectedHotelId]);
                hotels = Array.isArray(fetched) ? fetched : (fetched.hotels || []);
                status = hotels.length > 0 ? 'success' : 'no_results';
            } else {
                const result = await searchHotelsInDatabase(messages);
                hotels = Array.isArray(result) ? result : (result.hotels || []);
                status = result.status || (hotels.length > 0 ? 'success' : 'no_results');
            }

            return { toolName: TOOL_NAMES.ROOM_SEARCH, status, hotels };
        } catch (err) {
            logger.error('ToolExecutor', 'ROOM_SEARCH failed unexpectedly', { error: err.message });
            return { toolName: TOOL_NAMES.ROOM_SEARCH, status: 'error', hotels: [], error: err.message };
        }
    }

    // Graceful fallback instead of hard throw — prevents crash on unknown tool names
    logger.warn('ToolExecutor', 'Unsupported tool name received, returning no-op', { toolName: decision.toolName });
    return {
        toolName: decision.toolName,
        status: 'error',
        hotels: [],
        error: `Unsupported AI tool: ${decision.toolName}`
    };
}

module.exports = {
    executeTool
};
