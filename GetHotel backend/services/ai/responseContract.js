/**
 * Builds a structured response contract around the LLM prose.
 * The existing frontend still consumes `reply` and `hotels`; new clients can use `cards`.
 */

function extractNextQuestion(reply = '') {
    const lines = String(reply)
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].endsWith('?')) {
            return lines[i];
        }
    }

    return null;
}

function buildCards({ responseType, hotels = [] }) {
    if (!Array.isArray(hotels) || hotels.length === 0) return [];

    if (responseType === 'rooms') {
        return hotels.flatMap(hotel => {
            const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
            return rooms.map(room => ({
                type: 'room',
                id: room.id,
                hotelId: hotel.id,
                hotelName: hotel.name,
                title: room.name,
                pricePerNight: room.promotionalPrice || room.pricePerNight,
                originalPricePerNight: room.pricePerNight,
                thumbnail: Array.isArray(room.images) && room.images.length > 0 ? room.images[0] : hotel.thumbnail,
                payload: room
            }));
        });
    }

    return hotels.map(hotel => ({
        type: 'hotel',
        id: hotel.id,
        title: hotel.name,
        city: hotel.city,
        pricePerNight: hotel.promotionalPrice || hotel.pricePerNight,
        originalPricePerNight: hotel.pricePerNight,
        thumbnail: hotel.thumbnail,
        payload: hotel
    }));
}

function applyResponseContract({
    reply,
    responseType,
    hotels = [],
    flights = null,
    tourPackage = null,
    workflowState = 'SEARCH_DESTINATION',
    nextQuestion = null,
    actions = null,
    memory = null,
    selectedHotel = null,
    selectedRoom = null
}) {
    const nextRequiredSlot = memory?.nextRequiredSlot || null;
    const finalNextQuestion = nextQuestion || extractNextQuestion(reply);
    const cards = buildCards({ responseType, hotels });

    return {
        reply,
        responseType,
        hotels,
        flights,
        tourPackage,
        cards,
        workflowState,
        nextRequiredSlot,
        nextQuestion: finalNextQuestion,
        actions,
        selectedHotel,
        selectedRoom
    };
}

module.exports = {
    applyResponseContract,
    buildCards,
    applyResponseContract
};
