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

    // If recommendedHotels is still empty, search for hotel names mentioned in reply or user query from database
    if (recommendedHotels.length === 0) {
        try {
            const combinedText = (reply + ' ' + lastQuery).toLowerCase();
            // Look for bolded hotel names e.g. **Hotel Name** or numbered hotel lists
            const boldMatches = Array.from(reply.matchAll(/\*\*([A-Za-z0-9\s'&.-]{3,50})\*\*/g)).map(m => m[1].trim());
            const numberedMatches = Array.from(reply.matchAll(/\d+\.\s+\*?\*?([A-Za-z0-9\s'&.-]{3,50})\*?\*?:/g)).map(m => m[1].trim());
            const candidateNames = Array.from(new Set([...boldMatches, ...numberedMatches])).filter(n => n.length > 3);

            if (candidateNames.length > 0) {
                const foundHotels = await prisma.hotel.findMany({
                    where: {
                        isActive: true,
                        OR: candidateNames.map(name => ({ name: { contains: name } }))
                    },
                    select: {
                        id: true, name: true, city: true, address: true, description: true,
                        pricePerNight: true, starRating: true, guestRating: true,
                        reviewCount: true, amenities: true, mainAmenities: true, isActive: true,
                        thumbnail: true, slug: true,
                        room: {
                            where: { status: 'active' },
                            select: { id: true, name: true, pricePerNight: true, maxOccupancy: true, images: true, description: true }
                        }
                    },
                    take: 5
                });
                if (foundHotels.length > 0) {
                    const { sanitizeHotels } = require('./hotelSearchService');
                    recommendedHotels = sanitizeHotels(foundHotels);
                }
            }
        } catch (nameMatchErr) {
            console.warn('[ResponseFormatter] Hotel name lookup fallback failed:', nameMatchErr.message);
        }
    }

    if (recommendedHotels.length === 0 && dbHotels.length > 0) {
        recommendedHotels = dbHotels;
    }

    const queryMentionsRooms = /\b(room|rooms|kamra|kamre|deluxe|suite|executive|king|queen|double|single|category|categories|option|options|tariff|rate|rates|price|types|view rooms|show rooms|room categories)\b/i.test(lastQuery) ||
                                intent === 'ROOM_SEARCH' ||
                                workflowState === 'SELECT_ROOM' ||
                                Boolean(explicitIdMatch) ||
                                (recommendedHotels.length === 1 && !/\b(hotels|list|all|other)\b/i.test(lastQuery));

    // Only suppress cards if booking is fully confirmed or user is on payment selection step
    const isPaymentOrConfirmed = ['PAYMENT_SUCCESS', 'BOOKING_CONFIRMED'].includes(workflowState);

    let responseType = 'general';
    let outputHotels = [];

    if (!isPaymentOrConfirmed) {
        if (recommendedHotels.length > 0) {
            outputHotels = recommendedHotels;
            responseType = (queryMentionsRooms || intent === 'ROOM_SEARCH' || Boolean(explicitIdMatch)) ? 'rooms' : 'hotels';
        } else if (dbHotels.length > 0) {
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
