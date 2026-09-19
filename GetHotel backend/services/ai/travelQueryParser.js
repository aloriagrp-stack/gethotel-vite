/**
 * In-House Travel Query & Entity Parser
 * Extracts intents, locations, areas, budgets, amenities, dates, and bargaining signals
 * Zero external AI API dependency.
 */

const KNOWN_CITIES = [
    "delhi", "new delhi", "mumbai", "goa", "jaipur", "agra", "bangalore", "bengaluru",
    "hyderabad", "chennai", "kolkata", "pune", "ahmedabad", "chandigarh", "shimla",
    "manali", "rishikesh", "haridwar", "udaipur", "jodhpur", "varanasi", "amritsar",
    "nainital", "mussoorie", "gurugram", "gurgaon", "noida", "ghaziabad", "faridabad"
];

const KNOWN_AREAS = [
    "paharganj", "karol bagh", "aerocity", "connaught place", "cp", "mahipalpur",
    "south delhi", "north delhi", "rohini", "dwarka", "chandni chowk", "lajpat nagar",
    "saket", "hauz khas", "nehru place", "jasola", "vasant kunj", "pitampura",
    "janakpuri", "anand vihar", "kashmere gate", "new delhi railway station", "ndls",
    "delhi airport", "igi airport", "t3", "t1", "t2", "calangute", "baga", "anjuna",
    "panaji", "candolim", "marine drive", "bandra", "andheri", "juhu", "colaba"
];

function extractBudget(text) {
    const t = text.toLowerCase();
    
    // Check for "k" notation: e.g. "2.5k", "3k"
    const kMatch = t.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
        return Math.round(parseFloat(kMatch[1]) * 1000);
    }

    // Check for "X to Y" range: e.g. "1500 to 2500", "2000-3000"
    const rangeMatch = t.match(/(?:₹|rs\.?|inr)?\s*(\d{3,6})\s*(?:to|-)\s*(?:₹|rs\.?|inr)?\s*(\d{3,6})/i);
    if (rangeMatch) {
        return {
            min: parseInt(rangeMatch[1], 10),
            max: parseInt(rangeMatch[2], 10)
        };
    }

    // Check for "under X", "below X", "X ke andar", "max X", "upto X"
    const maxMatch = t.match(/(?:under|below|max|upto|within|ke\s*andar|tak)?\s*(?:₹|rs\.?|inr)?\s*(\d{3,6})\s*(?:rs\.?|inr|\/-|tak|ke\s*andar)?/i);
    if (maxMatch) {
        const val = parseInt(maxMatch[1], 10);
        if (val && val !== 2024 && val !== 2025 && val !== 2026 && val >= 500) {
            return { max: val };
        }
    }

    return null;
}

function extractLocation(text) {
    const t = text.toLowerCase();
    let city = null;
    let area = null;

    for (const a of KNOWN_AREAS) {
        const regex = new RegExp(`\\b${a}\\b`, 'i');
        if (regex.test(t)) {
            area = a.charAt(0).toUpperCase() + a.slice(1);
            if (["paharganj", "karol bagh", "aerocity", "connaught place", "cp", "mahipalpur", "south delhi", "rohini", "dwarka", "chandni chowk", "saket", "vasant kunj", "ndls"].includes(a)) {
                city = "Delhi";
            } else if (["calangute", "baga", "anjuna", "panaji", "candolim"].includes(a)) {
                city = "Goa";
            } else if (["marine drive", "bandra", "andheri", "juhu", "colaba"].includes(a)) {
                city = "Mumbai";
            }
            break;
        }
    }

    if (!city) {
        for (const c of KNOWN_CITIES) {
            const regex = new RegExp(`\\b${c}\\b`, 'i');
            if (regex.test(t)) {
                city = c.charAt(0).toUpperCase() + c.slice(1);
                if (city.toLowerCase() === "new delhi") city = "Delhi";
                if (city.toLowerCase() === "bengaluru") city = "Bangalore";
                if (city.toLowerCase() === "gurugram") city = "Gurgaon";
                break;
            }
        }
    }

    return { city, area };
}

function extractGuestsAndRooms(text) {
    const t = text.toLowerCase();
    let guests = 2;
    let rooms = 1;

    const guestMatch = t.match(/(\d+)\s*(?:guest|guests|person|persons|adult|adults|log|people|pax)/i);
    if (guestMatch) {
        guests = parseInt(guestMatch[1], 10);
    }

    const roomMatch = t.match(/(\d+)\s*(?:room|rooms|kamra|kamre)/i);
    if (roomMatch) {
        rooms = parseInt(roomMatch[1], 10);
    }

    return { guests, rooms };
}

function extractAmenitiesAndTags(text) {
    const t = text.toLowerCase();
    const tags = [];
    const amenities = [];

    if (/couple|couples|unmarried|girlfriend|gf|lovers/i.test(t)) {
        tags.push("coupleFriendly");
    }
    if (/family|bache|kids|family\s*friendly/i.test(t)) {
        tags.push("familyFriendly");
    }
    if (/pet|pets|dog|dogs|cat/i.test(t)) {
        tags.push("petFriendly");
    }

    if (/bathtub|bath\s*tub|tub/i.test(t)) amenities.push("Bathtub");
    if (/jacuzzi|whirlpool/i.test(t)) amenities.push("Jacuzzi");
    if (/pool|swimming/i.test(t)) amenities.push("Swimming Pool");
    if (/balcony|terrace/i.test(t)) amenities.push("Balcony");
    if (/parking|car\s*parking/i.test(t)) amenities.push("Parking");
    if (/breakfast|nashta|food/i.test(t)) amenities.push("Complimentary Breakfast");
    if (/ac|air\s*condition/i.test(t)) amenities.push("Air Conditioning");
    if (/wifi|wi-fi|internet/i.test(t)) amenities.push("Free Wi-Fi");

    return { tags, amenities };
}

function extractDates(text) {
    const t = text.toLowerCase();
    const today = new Date();
    let checkIn = null;
    let checkOut = null;

    if (/\b(today|aaj|tonight)\b/i.test(t)) {
        checkIn = new Date(today);
        checkOut = new Date(today);
        checkOut.setDate(checkOut.getDate() + 1);
    } else if (/\b(tomorrow|kal)\b/i.test(t)) {
        checkIn = new Date(today);
        checkIn.setDate(checkIn.getDate() + 1);
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 1);
    } else if (/\b(weekend|this\s*weekend)\b/i.test(t)) {
        checkIn = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToFriday = (5 - dayOfWeek + 7) % 7;
        checkIn.setDate(checkIn.getDate() + (daysToFriday === 0 ? 7 : daysToFriday));
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 2);
    }

    return { checkIn, checkOut };
}

function parseTravelQuery(query = "") {
    const q = query.trim();
    const qLower = q.toLowerCase();

    // 1. Detect Intent
    let intent = "HOTEL_SEARCH";

    // Greeting
    if (/^(hi|hello|hey|greetings|namaste|pranam|hola|kya\s*haal|good\s*(?:morning|afternoon|evening))\b/i.test(qLower) && !/(hotel|room|delhi|stay|book|price|rate)/i.test(qLower)) {
        intent = "GREETING";
    }
    // Bargain / Discount
    else if (/\b(discount|kam\s*karo|kam\s*kardo|sasta\s*karo|kam\s*me|bargain|deal|offer|coupon|code|kuch\s*off|last\s*price|kam\s*nahi\s*hoga)\b/i.test(qLower)) {
        intent = "BARGAIN_DISCOUNT";
    }
    // Booking confirmation
    else if (/\b(book\s*kardo|book\s*karna\s*hai|confirm\s*booking|payment\s*karni|pay\s*karna|reserve\s*kardo|book\s*now|deal\s*done|final\s*karo)\b/i.test(qLower)) {
        intent = "BOOKING_INTENT";
    }
    // FAQ / Policy inquiry
    else if (/\b(local\s*id|id\s*proof|unmarried\s*couple|check\s*in\s*time|check\s*out\s*time|early\s*check\s*in|late\s*check\s*out|cancellation|refund|couple\s*allowed)\b/i.test(qLower)) {
        intent = "POLICY_FAQ";
    }
    // Amenity specific inquiry
    else if (/\b(parking\s*hai|pool\s*hai|bathtub\s*hai|wifi\s*hai|breakfast\s*milta|lift\s*hai)\b/i.test(qLower)) {
        intent = "AMENITY_QUERY";
    }

    const { city, area } = extractLocation(q);
    const budget = extractBudget(q);
    const { guests, rooms } = extractGuestsAndRooms(q);
    const { tags, amenities } = extractAmenitiesAndTags(q);
    const { checkIn, checkOut } = extractDates(q);

    return {
        intent,
        rawQuery: q,
        city,
        area,
        budget,
        guests,
        rooms,
        tags,
        amenities,
        dates: { checkIn, checkOut }
    };
}

module.exports = {
    parseTravelQuery,
    extractBudget,
    extractLocation,
    extractGuestsAndRooms,
    extractAmenitiesAndTags,
    extractDates
};
