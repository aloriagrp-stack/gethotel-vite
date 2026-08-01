const { fetchHotelsByIds } = require('./hotelSearchService');
const prisma = require('../../config/db');
const { applyResponseContract } = require('./responseContract');

/**
 * Response Formatter Service
 * Parses markdown links, matches recommended hotels, and determines responseType
 */

async function formatAiResponse({
    reply,
    lastUserQuery,
    dbHotels = [],
    workflowState = 'SEARCH_DESTINATION',
    intent = 'GENERAL_CHAT',
    actions = null,
    memory = null,
    selectedHotel = null,
    selectedRoom = null
}) {
    // Parse recommended hotel IDs or hotel names mentioned in the AI response text
    const regex = /\/hotel\/(\d+)/g;
    let match;
    const hotelIds = [];
    while ((match = regex.exec(reply)) !== null) {
        hotelIds.push(parseInt(match[1]));
    }

    let recommendedHotels = [];
    const lastQuery = (lastUserQuery || '').toLowerCase();

    // Check if user query mentions an explicit hotel ID e.g. "(ID: 18)" or "hotel/18" or "view rooms for Toshali"
    const explicitIdMatch = lastQuery.match(/\b(?:id[:\s]*|hotel\/)(\d+)\b/i);
    if (explicitIdMatch) {
        const targetId = parseInt(explicitIdMatch[1], 10);
        const matched = dbHotels.filter(h => h.id === targetId);
        if (matched.length > 0) {
            recommendedHotels = matched;
        } else {
            const fetched = await fetchHotelsByIds([targetId]);
            if (fetched.length > 0) recommendedHotels = fetched;
        }
    }

    if (recommendedHotels.length === 0 && dbHotels.length > 0) {
        // Match hotels by exact name or key name words mentioned in AI reply or user query
        const combinedText = (reply + ' ' + lastQuery).toLowerCase();
        recommendedHotels = dbHotels.filter(h => {
            const fullNameMatch = new RegExp(h.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(combinedText);
            if (fullNameMatch) return true;
            const keyWords = h.name.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['hotel', 'resort', 'stay', 'inn', 'suites', 'trend'].includes(w));
            return keyWords.length > 0 && keyWords.every(w => combinedText.includes(w));
        });
        // If fuzzy match found nothing, fallback to dbHotels
        if (recommendedHotels.length === 0) {
            recommendedHotels = dbHotels;
        }
    }

    const queryMentionsRooms = /\b(room|rooms|kamra|kamre|deluxe|suite|executive|king|queen|double|single|category|categories|option|options|tariff|rate|rates|price|types|view rooms|show rooms|room categories)\b/i.test(lastQuery) ||
                                intent === 'ROOM_SEARCH' ||
                                workflowState === 'SELECT_ROOM' ||
                                Boolean(explicitIdMatch) ||
                                (recommendedHotels.length === 1 && !/\b(hotels|list|all|other)\b/i.test(lastQuery));

    // Suppress room/hotel card rendering if collecting guest details OR if intent is non-hotel (Tours, General Chat)
    const isNonHotelQuery = ['INDIA_TOUR_PLANNER'].includes(intent);
    const isCollectingPersonalDetails = ['COLLECT_GUEST_NAME', 'COLLECT_PHONE', 'COLLECT_EMAIL', 'BOOKING_CONFIRMED'].includes(workflowState) ||
                                          /poora naam|full name|guest name|mobile number|email address|enter your name|share your email/i.test(reply);

    const queryMentionsStays = /\b(hotel|hotels|resort|room|rooms|stay|stays|inn|suites|kamra|kamre|price|budget|book|jaipur|goa|udaipur|shimla|manali|delhi|mumbai|bangalore|pune|agra|varanasi)\b/i.test(lastQuery);

    let responseType = 'general';
    let outputHotels = [];

    if (!isCollectingPersonalDetails) {
        if (recommendedHotels.length > 0) {
            outputHotels = recommendedHotels;
            responseType = (queryMentionsRooms || intent === 'ROOM_SEARCH' || Boolean(explicitIdMatch)) ? 'rooms' : 'hotels';
        } else if (dbHotels.length > 0 && (queryMentionsStays || !isNonHotelQuery)) {
            outputHotels = dbHotels.slice(0, 5);
            responseType = (queryMentionsRooms || intent === 'ROOM_SEARCH') ? 'rooms' : 'hotels';
        }
    }

    const resolvedSelectedHotel = selectedHotel || (recommendedHotels.length > 0 ? {
        id: recommendedHotels[0].id,
        name: recommendedHotels[0].name,
        city: recommendedHotels[0].city
    } : null);

    return applyResponseContract({
        reply,
        responseType,
        hotels: outputHotels,
        workflowState,
        actions,
        memory,
        selectedHotel: resolvedSelectedHotel,
        selectedRoom
    });
}

module.exports = {
    formatAiResponse
};
