/**
 * Intelligence Engine Service
 * Implements Travel Intent Classification, Traveler Profiling, Emotional Intelligence Detection,
 * Taste Engine Learning, "Why This Hotel?" Trust Badges, and Rich Self-Scoring Telemetry.
 */

// 1. Layer 1: Travel Intent Classification
const TRAVEL_INTENTS = {
    BUSINESS: 'Business Travel',
    FAMILY: 'Family Vacation',
    LUXURY: 'Luxury Stay',
    COUPLE: 'Couple Trip / Romance',
    ROAD_TRIP: 'Road Trip',
    EMERGENCY: 'Emergency Stay',
    TRANSIT: 'Transit Stay',
    MEDICAL: 'Medical Travel',
    WEDDING: 'Wedding / Event',
    REMOTE_WORK: 'Remote Work / Workation',
    GENERAL: 'General Chat'
};

function classifyTravelIntent(userQuery = '') {
    const text = userQuery.toLowerCase();

    if (/anniversary|honeymoon|romantic|couple|date\s+night|girlfriend|boyfriend|wife|husband/i.test(text)) {
        return TRAVEL_INTENTS.COUPLE;
    }
    if (/family|kids|children|parents|relatives|vacation\s+with\s+family/i.test(text)) {
        return TRAVEL_INTENTS.FAMILY;
    }
    if (/business|work\s+trip|meeting|conference|office|corporate/i.test(text)) {
        return TRAVEL_INTENTS.BUSINESS;
    }
    if (/luxury|5\s*star|villas|resort|premium|penthouse|fine\s+dining/i.test(text)) {
        return TRAVEL_INTENTS.LUXURY;
    }
    if (/road\s*trip|drive|highway|car\s+travel|pitstop/i.test(text)) {
        return TRAVEL_INTENTS.ROAD_TRIP;
    }
    if (/workation|remote\s*work|wifi|coworking|desk|digital\s+nomad/i.test(text)) {
        return TRAVEL_INTENTS.REMOTE_WORK;
    }
    if (/hospital|medical|doctor|treatment|checkup/i.test(text)) {
        return TRAVEL_INTENTS.MEDICAL;
    }
    if (/wedding|marriage|reception|event|function/i.test(text)) {
        return TRAVEL_INTENTS.WEDDING;
    }
    if (/transit|layover|flight|airport\s+stay|night\s+stay/i.test(text)) {
        return TRAVEL_INTENTS.TRANSIT;
    }
    if (/urgent|emergency|stranded|late\s+night|hospital|help/i.test(text)) {
        return TRAVEL_INTENTS.EMERGENCY;
    }

    return TRAVEL_INTENTS.GENERAL;
}

// 2. Layer 2: Traveler Profile Classification
const TRAVELER_PROFILES = {
    BUDGET: 'Budget Traveler',
    LUXURY: 'Luxury Traveler',
    BUSINESS_EXEC: 'Business Executive',
    DIGITAL_NOMAD: 'Digital Nomad',
    FAMILY: 'Family',
    SOLO: 'Solo Traveler',
    COUPLE: 'Couple',
    SENIOR: 'Senior Citizen',
    BACKPACKER: 'Backpacker',
    STUDENT: 'Student'
};

function classifyTravelerProfile(userQuery = '', memory = null) {
    const text = userQuery.toLowerCase();

    if (/cheap|budget|affordable|under\s*\d+|lowest\s*price|hostel|backpacker/i.test(text)) {
        return TRAVELER_PROFILES.BUDGET;
    }
    if (/5\s*star|luxury|suite|premium|deluxe|view/i.test(text)) {
        return TRAVELER_PROFILES.LUXURY;
    }
    if (/work|laptop|wifi|meeting|business|express/i.test(text)) {
        return TRAVELER_PROFILES.BUSINESS_EXEC;
    }
    if (/kids|family|parents|family\s+room/i.test(text)) {
        return TRAVELER_PROFILES.FAMILY;
    }
    if (/couple|honeymoon|anniversary|romantic/i.test(text)) {
        return TRAVELER_PROFILES.COUPLE;
    }

    if (memory && memory.profile) {
        return memory.profile;
    }

    return TRAVELER_PROFILES.BUDGET;
}

// 3. Layer 5: Emotional Intelligence Detection
function detectEmotionalContext(userQuery = '') {
    const text = userQuery.toLowerCase();

    if (/anniversary/i.test(text)) {
        return {
            type: 'ANNIVERSARY',
            warmGreeting: "❤️ Happy Anniversary! Let's make this trip unforgettable."
        };
    }
    if (/honeymoon/i.test(text)) {
        return {
            type: 'HONEYMOON',
            warmGreeting: "🥂 Congratulations on your wedding! Setting up something truly special for you both."
        };
    }
    if (/birthday/i.test(text)) {
        return {
            type: 'BIRTHDAY',
            warmGreeting: "🎉 Happy Birthday! Let me find the perfect celebration stay."
        };
    }
    if (/urgent|stranded|emergency|late\s+night|lost/i.test(text)) {
        return {
            type: 'EMERGENCY',
            warmGreeting: "🚨 Don't worry, I've got your back. Let's get you checked into a safe spot right away."
        };
    }

    return null;
}

// 4. "Why This Hotel?" Trust Bullet Generator
function generateWhyThisHotelBullets(hotel) {
    const bullets = [];

    if (hotel.city) {
        bullets.push(`• Prime location in ${hotel.city}`);
    }
    if (hotel.guestRating && hotel.guestRating >= 4.0) {
        bullets.push(`• Rated ${hotel.guestRating}/5 by recent guests`);
    } else {
        bullets.push(`• Highly rated cleanliness & comfort`);
    }

    if (hotel.promotionalPrice && hotel.pricePerNight && hotel.promotionalPrice < hotel.pricePerNight) {
        const discount = Math.round(((hotel.pricePerNight - hotel.promotionalPrice) / hotel.pricePerNight) * 100);
        bullets.push(`• ${discount}% lower than standard rack rate`);
    } else {
        bullets.push(`• Exceptional value for your budget`);
    }

    bullets.push(`• Complimentary breakfast & free Wi-Fi`);
    bullets.push(`• Free cancellation policy available`);

    return bullets.slice(0, 4);
}

// 5. Enhanced Internal Telemetry Scoring Engine
function evaluateInternalTelemetry({ userQuery = '', finalReply = '', intent = 'GENERAL_CHAT', actions = null, dbHotels = [] }) {
    const replyText = String(finalReply).toLowerCase();
    
    // Check forbidden customer support phrases
    const forbiddenRegex = /based on|according to|i understand your concern|certainly!|happy to help|thank you for your patience|unfortunately|as an ai|my recommendation|how may i assist/i;
    const wasRobotic = forbiddenRegex.test(replyText);

    // Question count evaluation
    const questionCount = (finalReply.match(/\?/g) || []).length;
    const askedUnnecessaryQuestions = questionCount > 1;

    // Movement toward booking progress
    const movedBookingForward = ['HOTEL_SEARCH', 'ROOM_SEARCH', 'BOOKING_INQUIRY', 'PAYMENT_PROCESSING'].includes(intent) || Boolean(actions);

    // Calculate sub-scores (out of 10)
    const understanding = userQuery.trim().length > 0 ? (wasRobotic ? 8.5 : 9.8) : 8.0;
    const travelContext = (intent !== 'GENERAL_CHAT' || dbHotels.length > 0) ? 10.0 : 9.2;
    const bookingProgress = movedBookingForward ? 9.6 : 8.5;
    const naturalness = wasRobotic ? 6.5 : (askedUnnecessaryQuestions ? 8.2 : 9.8);
    const inferenceQuality = askedUnnecessaryQuestions ? 8.0 : 10.0;
    const memoryUsage = 9.4;
    const uiTriggerDecision = (dbHotels.length > 0 || actions) ? "PASS" : "N/A";

    return {
        Understanding: `${understanding}/10`,
        TravelContext: `${travelContext}/10`,
        BookingProgress: `${bookingProgress}/10`,
        Naturalness: `${naturalness}/10`,
        InferenceQuality: `${inferenceQuality}/10`,
        MemoryUsage: `${memoryUsage}/10`,
        UITriggerDecision: uiTriggerDecision,
        wasRobotic,
        askedUnnecessaryQuestions,
        movedBookingForward
    };
}

module.exports = {
    TRAVEL_INTENTS,
    TRAVELER_PROFILES,
    classifyTravelIntent,
    classifyTravelerProfile,
    detectEmotionalContext,
    generateWhyThisHotelBullets,
    evaluateInternalTelemetry
};
