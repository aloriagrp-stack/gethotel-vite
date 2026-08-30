const { KNOWN_CITIES } = require('./hotelSearchService');

/**
 * Intent Detector Service
 * Classifies user intent from chat history and prompt text
 */

const INTENTS = {
    HOTEL_SEARCH: 'HOTEL_SEARCH',
    ROOM_SEARCH: 'ROOM_SEARCH',
    HOURLY_STAY_SEARCH: 'HOURLY_STAY_SEARCH',
    FLIGHT_SEARCH: 'FLIGHT_SEARCH',
    INDIA_TOUR_PLANNER: 'INDIA_TOUR_PLANNER',
    BOOKING_INQUIRY: 'BOOKING_INQUIRY',
    PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
    GENERAL_CHAT: 'GENERAL_CHAT'
};

function detectIntent(userQuery = '', history = [], memory = {}) {
    const text = userQuery.toLowerCase();

    // Check if the user wants to ignore hotel/travel and just chat
    const wantsToJustChat = /\b(chhod|chhod|chord|ignore|leave|stop|rehne)\b.*\b(hotel|hotels|travel|booking|stay|stays)\b/i.test(text) ||
        (/\b(baat|baate|baatein|chat|talk|convers)\b/i.test(text) && /\b(chhod|chhod|chord|ignore|leave|stop|nahi|no)\b/i.test(text)) ||
        /^(just\s+chat|baat\s+karni|baatein\s+karni|baat\s+karo)/i.test(text) ||
        /^(bhai\s+bas\s+baatein|bas\s+baatein|chitchat)/i.test(text);
    if (wantsToJustChat) {
        return INTENTS.GENERAL_CHAT;
    }

    // 0. Check card inquiry or missing card complaint (e.g. "I haven't seeing any cards", "no cards", "cards nahi dikhre", "show cards")
    const isCardInquiry = /\b(card|cards|photos?|images?|pics?|tasveer|pictures?|dikh|dikha|dikhao|options?|recommendations?)\b/i.test(text) ||
                          /\b(haven'?t\s+see|didn'?t\s+see|not\s+see|don'?t\s+see|can'?t\s+see|no\s+cards?|cards?\s+nahi|kaha\s+hai|kaha\s+h|where\s+are)\b/i.test(text);
    if (isCardInquiry) {
        return memory?.selectedHotelId ? INTENTS.ROOM_SEARCH : INTENTS.HOTEL_SEARCH;
    }

    // 1. Check Hourly Stay intent
    const isHourlyQuery = /\b(3\s*ghant|6\s*ghant|12\s*ghant|hourly|microstay|transit\s*room|layover\s*stay|day\s*use|few\s*hours)\b/i.test(text);
    if (isHourlyQuery) return INTENTS.HOURLY_STAY_SEARCH;

    // 2. Check India Tour Planner intent
    const isTourQuery = /\b(tour|package|itinerary|trip\s+plan|days\s+trip|days\s+tour|sightseeing\s+plan|holiday\s+package)\b/i.test(text);
    if (isTourQuery) return INTENTS.INDIA_TOUR_PLANNER;

    // Strict room check — requires explicit room/kamra keywords OR date follow-up with active hotel in memory
    const isExplicitRoomQuery = /\b(room|rooms|kamra|kamre|bed|suite)\b/i.test(text);
    const isDateFollowUp = /\b(\d{1,2}(?:st|nd|rd|th)?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)?|kal|parso|today|tomorrow|weekend|dates?)\b/i.test(text);

    // Context Anchor: If memory has an active selected hotel and user asks a date follow-up, lock to ROOM_SEARCH
    if ((memory.selectedHotelId || memory.selectedHotelName) && (isExplicitRoomQuery || isDateFollowUp)) {
        return INTENTS.ROOM_SEARCH;
    }

    // Check booking / reservation / guest details keywords (only if user provides details, not when asking for cards)
    const isBookingQuery = (/book|booking|reserve|reservation|confirm|email|phone|mobile|name\s+is|contact/i.test(text) ||
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(text) ||
        /(?:\+91[\s-]?)?[6-9]\d{9}\b/.test(text)) && !isCardInquiry;

    // Check payment keywords
    const isPaymentQuery = /pay|payment|razorpay|card\s+number|upi|cvv/i.test(text);

    // Check known cities or travel parameters (weekend, under X, breakfast, guests)
    const hasKnownCity = KNOWN_CITIES.some(city => new RegExp(`\\b${city}\\b`, 'i').test(text));
    const hasTravelParams = /weekend|vacation|trip|getaway|under\s*\d+|below\s*\d+|breakfast|guests|people|couple/i.test(text);

    // Check hotel search keywords
    const isHotelQuery = /hotel|hotels|resort|resorts|stay|stays|place|places|find|search|dikha|dikhao|card|cards|options?|recommendations?/i.test(text) || hasKnownCity || hasTravelParams;

    if (isPaymentQuery) return INTENTS.PAYMENT_PROCESSING;
    if (isBookingQuery) return INTENTS.BOOKING_INQUIRY;
    if (isExplicitRoomQuery) return INTENTS.ROOM_SEARCH;
    if (isHotelQuery && !/hello|hi|hey|kaisa|kaise|kaun|who|what\s+is|joke|help/i.test(text)) return INTENTS.HOTEL_SEARCH;

    // Pure casual greetings or chat
    if (/^(hello|hi|hey|hola|greetings|wassup|sup|bro|bhai)(\s+|$)/i.test(text)) {
        return INTENTS.GENERAL_CHAT;
    }

    if (isHotelQuery) return INTENTS.HOTEL_SEARCH;

    return INTENTS.GENERAL_CHAT;
}

module.exports = {
    INTENTS,
    detectIntent
};
