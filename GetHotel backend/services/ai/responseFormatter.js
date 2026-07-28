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
    if (hotelIds.length > 0) {
        recommendedHotels = await fetchHotelsByIds(hotelIds);
    } else if (dbHotels.length > 0 && ['HOTEL_SEARCH', 'ROOM_SEARCH', 'HOURLY_STAY_SEARCH'].includes(intent)) {
        // Match hotels by exact name or key name words mentioned in AI reply
        recommendedHotels = dbHotels.filter(h => {
            const fullNameMatch = new RegExp(h.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(reply);
            if (fullNameMatch) return true;
            const keyWords = h.name.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['hotel', 'resort', 'stay', 'inn', 'suites', 'trend'].includes(w));
            return keyWords.length > 0 && keyWords.every(w => reply.toLowerCase().includes(w));
        });
        // If fuzzy match found nothing, fallback to dbHotels
        if (recommendedHotels.length === 0) {
            recommendedHotels = dbHotels;
        }
    }

    const lastQuery = (lastUserQuery || '').toLowerCase();
    const queryMentionsRooms = /\b(room|rooms|kamra|kamre)\b/i.test(lastQuery);

    // Suppress room/hotel card rendering if collecting guest details OR if intent is non-hotel (Tours, General Chat)
    const isNonHotelQuery = ['INDIA_TOUR_PLANNER', 'GENERAL_CHAT'].includes(intent);
    const isCollectingPersonalDetails = ['COLLECT_GUEST_NAME', 'COLLECT_PHONE', 'COLLECT_EMAIL', 'BOOKING_CONFIRMED'].includes(workflowState) ||
                                          /poora naam|full name|guest name|mobile number|email address|enter your name|share your email/i.test(reply);

    let responseType = 'general';
    let outputHotels = [];

    if (!isCollectingPersonalDetails && !isNonHotelQuery) {
        if (recommendedHotels.length > 0) {
            outputHotels = recommendedHotels;
            responseType = queryMentionsRooms ? 'rooms' : 'hotels';
        } else if (dbHotels.length > 0) {
            outputHotels = dbHotels.slice(0, 5);
            responseType = queryMentionsRooms ? 'rooms' : 'hotels';
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
