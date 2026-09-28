/**
 * In-House Dynamic Response Synthesizer
 * Zero repetition combinatorial natural language generation.
 * Generates fresh, varied, professional simple English replies on CPU in < 1ms.
 */

// Helper to pick a random item from array excluding recently used ones (True Shuffle-Deck)
function pickVariant(array, usedSet = new Set()) {
    if (!array || array.length === 0) return '';
    const available = array.filter(item => !usedSet.has(item));
    const pool = available.length > 0 ? available : array;
    if (available.length === 0) {
        // Clear recent set for this pool so it cycles smoothly
        array.forEach(item => usedSet.delete(item));
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedSet.add(chosen);
    return chosen;
}

// ---------------------------------------------------------------------------
// 1. GREETING VARIANTS
// ---------------------------------------------------------------------------
const GREETING_OPENERS = [
    "Hello! Welcome to GetHotelStays.",
    "Hey there! Great to connect with you.",
    "Hi! ChatGHS at your service.",
    "Hey! Excited to help you plan your next stay.",
    "Hello there! Hope your day is going great.",
    "Hey! Welcome aboard.",
    "Hi there! Ready whenever you are.",
    "Good to see you! How can I make your travel easier today?"
];

const GREETING_CLOSERS = [
    "Where are you thinking of traveling next?",
    "Tell me a city or budget, and I'll find top verified stays for you.",
    "Got a destination in mind for your next trip?",
    "Are we looking for hotel stays, airport transit rooms, or a custom tour package?",
    "Which destination is on your radar today?",
    "Tell me where you want to go, and I'll pull up the best options right away!"
];

const GREETING_REPEAT_OPENERS = [
    "Hey again! 😄 Still planning that trip?",
    "Welcome back! Ready to explore some more options?",
    "Hey there! What destination are we looking at now?",
    "Hello again! Let me know where you'd like to stay next."
];

// ---------------------------------------------------------------------------
// 2. IDENTITY VARIANTS ("Who are you")
// ---------------------------------------------------------------------------
const IDENTITY_OPENERS = [
    "I'm ChatGHS — your personal AI Travel Concierge for GetHotelStays.com! ✈️",
    "You're speaking with ChatGHS, the official intelligent travel partner for GetHotelStays. 🏨",
    "I'm ChatGHS! Think of me as your personal travel-savvy friend and booking specialist.",
    "I am ChatGHS — an in-house travel intelligence engine built right into GetHotelStays.com."
];

const IDENTITY_BODIES = [
    "I help you search, compare, and instantly book verified hotels, 3hr/6hr transit micro-stays, and custom India tour itineraries with zero hassle.",
    "My job is to find you the best hotel deals, check couple-friendly stays, plan conflict-free holiday itineraries, and unlock instant savings with promo codes.",
    "From budget rooms under ₹2,000 to 5-star luxury resorts, airport transit stays, and flights — I handle the research and let you reserve with just a 12% deposit."
];

const IDENTITY_CLOSERS = [
    "Where are we heading next? Tell me your destination!",
    "Got a city or holiday plan in mind? Let's get started.",
    "Tell me where you want to go, and I'll pull up verified stays in seconds!",
    "How can I help you plan your trip today?"
];

// ---------------------------------------------------------------------------
// 3. CAPABILITIES VARIANTS ("What can you do for me")
// ---------------------------------------------------------------------------
const CAPABILITY_HEADS = [
    "Here is what I can do for you at GetHotelStays:",
    "I'm built to make travel planning effortless. Here's how I can help:",
    "Here are my core superpowers as your travel concierge:",
    "Whether you're traveling for business or leisure, here's what I bring to the table:"
];

const CAPABILITY_BULLETS_SET_A = [
    "• **Verified Hotel Search**: Find top-rated, clean hotels across India (Delhi, Jaipur, Goa, Mumbai, and more) filtered by your exact budget.",
    "• **In-Chat Instant Booking**: Reserve rooms directly within chat with a 12% advance deposit or pay at the hotel.",
    "• **Flexible Micro-Stays**: Book 3-hour, 6-hour, or 12-hour transit stays near major airports and railway hubs.",
    "• **Conflict-Free Tour Packages**: Get custom day-by-day itineraries for Goa, Himachal, Rajasthan, and Kerala.",
    "• **Instant Promo Discounts**: Apply promo code **GHS10** for an instant flat 10% discount on bookings."
];

const CAPABILITY_BULLETS_SET_B = [
    "• **Smart Budget Stays**: Quality stays from ₹1,500/night with AC, complimentary Wi-Fi, and verified amenities.",
    "• **Couple-Friendly & Local ID**: 100% verified properties welcoming adult couples with original Government ID proof.",
    "• **Zero Interrogation**: No clunky forms — just type naturally like chatting with a friend.",
    "• **Airport & Station Transit**: Short stay rooms for flight layovers and quick freshen-ups.",
    "• **Exclusive Deals**: Save an extra 10% right away using coupon code **GHS10**."
];

const CAPABILITY_CLOSERS = [
    "What kind of trip are you planning right now?",
    "Tell me a city and budget, and I'll find top verified options for you!",
    "Ready to search? Drop a destination and let's explore.",
    "Where would you like to travel first?"
];

// ---------------------------------------------------------------------------
// 4. STATUS / SMALL TALK VARIANTS ("How are you")
// ---------------------------------------------------------------------------
const SMALLTALK_REPLIES = [
    "I'm doing fantastic, thank you! 😄 Fully energized and ready to help you plan your next trip. Where are you heading?",
    "All systems running smooth and fast! 🚀 How are you doing today? Got any vacation plans brewing?",
    "Doing great! Just browsing through the best hotel deals across India. How can I help you today?",
    "Feeling great and excited to help you travel! 🎒 What destination do you have in mind?"
];

// ---------------------------------------------------------------------------
// 5. GRATITUDE VARIANTS ("Thank you / Thanks")
// ---------------------------------------------------------------------------
const GRATITUDE_REPLIES = [
    "You're very welcome! 🌟 Let me know whenever you'd like to check room photos, dates, or explore another city.",
    "Always happy to help! If you need anything else for your trip, I'm right here. Safe travels! 🎒✈️",
    "Glad I could help! Take your time checking the options, and let me know when you're ready to reserve.",
    "Anytime! Reach out whenever you need hotel recommendations or travel tips. Have a great day!"
];

// ---------------------------------------------------------------------------
// 6. FAREWELL VARIANTS ("Bye")
// ---------------------------------------------------------------------------
const FAREWELL_REPLIES = [
    "Goodbye! Have a safe and wonderful journey. ChatGHS is always here whenever you need a stay! ✈️✨",
    "See you soon! Wishing you fantastic travels ahead. Feel free to come back anytime.",
    "Take care! Have a great trip and reach out anytime you need hotel deals or itineraries! 🎒"
];

// ---------------------------------------------------------------------------
// 7. HOTEL RECOMMENDATION PROSE VARIANTS
// ---------------------------------------------------------------------------
const HOTEL_PROSE_TEMPLATES = [
    (loc, topName, price, tag) => `I've found some fantastic${tag} stays in **${loc}** for you! Leading the recommendations is **${topName}** — offering verified quality at ₹${price}/night with AC, free Wi-Fi, and great guest ratings. 🏨⭐\n\nTake a look at the hotel cards below to explore room categories and photos, or tap 'Book Now' to lock in your stay! 👇`,
    (loc, topName, price, tag) => `Here are top-rated${tag} options in **${loc}** matching your preferences! **${topName}** is an outstanding choice starting at ₹${price} per night with verified amenities and hassle-free check-in. 🏨✨\n\nBrowse the photos and room packages below, and reserve whenever you're ready! 👇`,
    (loc, topName, price, tag) => `Great choice! For **${loc}**, here are top-tier verified properties${tag}. **${topName}** stands out as a prime spot at ₹${price}/night with air conditioning, complimentary Wi-Fi, and prime location. 🌟\n\nCheck out the cards below to view room details or proceed to instant booking! 👇`,
    (loc, topName, price, tag) => `Looking good for **${loc}**! We have verified${tag} accommodations available right now. **${topName}** is our top recommendation at ₹${price}/night with reliable service and clean rooms. 🏖️\n\nReview the room categories below and let me know if you'd like to lock in your check-in dates! 👇`
];

// ---------------------------------------------------------------------------
// Synthesizer Engine Class
// ---------------------------------------------------------------------------
class DynamicSynthesizer {
    constructor() {
        this.recentHistory = new Set();
    }

    _remember(text) {
        if (!text) return;
        this.recentHistory.add(text.slice(0, 40));
        if (this.recentHistory.size > 50) {
            const first = this.recentHistory.values().next().value;
            this.recentHistory.delete(first);
        }
    }

    generateGreeting(isRepeat = false) {
        let text = "";
        if (isRepeat) {
            text = pickVariant(GREETING_REPEAT_OPENERS, this.recentHistory);
        } else {
            const opener = pickVariant(GREETING_OPENERS, this.recentHistory);
            const closer = pickVariant(GREETING_CLOSERS, this.recentHistory);
            text = `${opener} ${closer}`;
        }
        this._remember(text);
        return text;
    }

    generateIdentity() {
        const opener = pickVariant(IDENTITY_OPENERS, this.recentHistory);
        const body = pickVariant(IDENTITY_BODIES, this.recentHistory);
        const closer = pickVariant(IDENTITY_CLOSERS, this.recentHistory);
        const text = `${opener}\n\n${body}\n\n${closer}`;
        this._remember(text);
        return text;
    }

    generateCapabilities() {
        const head = pickVariant(CAPABILITY_HEADS, this.recentHistory);
        const bullets = Math.random() > 0.5 ? CAPABILITY_BULLETS_SET_A : CAPABILITY_BULLETS_SET_B;
        const closer = pickVariant(CAPABILITY_CLOSERS, this.recentHistory);
        const text = `${head}\n\n${bullets.join('\n')}\n\n${closer}`;
        this._remember(text);
        return text;
    }

    generateSmallTalk() {
        const text = pickVariant(SMALLTALK_REPLIES, this.recentHistory);
        this._remember(text);
        return text;
    }

    generateGratitude() {
        const text = pickVariant(GRATITUDE_REPLIES, this.recentHistory);
        this._remember(text);
        return text;
    }

    generateFarewell() {
        const text = pickVariant(FAREWELL_REPLIES, this.recentHistory);
        this._remember(text);
        return text;
    }

    generateHotelProse({ location, topHotel, price, tags = [] }) {
        const loc = location || "your destination";
        const topName = topHotel || "Top Recommended Stay";
        const p = price || 1999;
        const tagDesc = tags.includes("coupleFriendly") ? " couple-friendly" : "";

        const templateFn = pickVariant(HOTEL_PROSE_TEMPLATES, this.recentHistory);
        const text = templateFn(loc, topName, p, tagDesc);
        this._remember(text);
        return text;
    }

    generateLanguageSwitch(lang = 'en', recentHotelInfo = null) {
        if (lang === 'hi') {
            return "Haanji bilkul! Ab hum aapse Hindi me baat karenge. Kahan chalne ka plan ban raha hai aapka? 🏨✨";
        }

        const openers = [
            "Certainly! Switching to English. 🇬🇧",
            "Understood! Let's continue in English. 🇬🇧",
            "Sure thing! Switching to English for you. 🇬🇧"
        ];
        const opener = pickVariant(openers, this.recentHistory);

        if (recentHotelInfo && recentHotelInfo.city) {
            const hotelMention = recentHotelInfo.name ? ` including **${recentHotelInfo.name}**` : '';
            return `${opener}\n\nI've pulled up verified accommodations in **${recentHotelInfo.city}**${hotelMention} featuring air conditioning, complimentary high-speed Wi-Fi, and great guest reviews.\n\nTake a look at the cards below, and let me know if you'd like to check specific room categories or lock in your check-in dates!`;
        }

        const closers = [
            "I'm your dedicated AI Travel Concierge. Would you like to explore verified hotels, 3hr/6hr transit stays, flights, or plan a custom India tour itinerary?",
            "How can I help you plan your journey today? Looking for hotel stays, flight routes, or a customized holiday package?",
            "I'm right here to assist you with your travels. Which destination are you planning to visit next?"
        ];
        const closer = pickVariant(closers, this.recentHistory);
        return `${opener}\n\n${closer}`;
    }

    generateTravelAdvice({ question, answer, category }) {
        const dynamicIntros = [
            "Here's what you need to know:",
            "Good question! Here's the travel insight for that:",
            "Here's the verified travel breakdown:",
            "Based on travel conditions and local insights:"
        ];
        const intro = pickVariant(dynamicIntros, this.recentHistory);
        const dynamicFollowups = [
            "\n\nWould you like me to check verified hotel availability or itineraries for this trip?",
            "\n\nLet me know if you'd like to explore recommended hotels or packing tips!",
            "\n\nTell me if you have travel dates in mind, and I can pull up matching stays!"
        ];
        const followup = pickVariant(dynamicFollowups, this.recentHistory);
        return `${intro}\n\n${answer}${followup}`;
    }

    generateFallback(query = '') {
        const fallbacks = [
            "I'm right here with you! Tell me the destination you have in mind (e.g., 'Hotels in Jaipur', 'Goa beach resort under ₹4,000', or 'Delhi Aerocity transit stay') and I'll find the best verified options right away! 🏨✈️",
            "I'm listening! Where are you planning to head next? Share a city, your budget, or trip dates, and I'll pull up top verified stays instantly! 🎒🌟",
            "Ready whenever you are! Just tell me your destination and preference (like 'couple-friendly in Delhi' or 'family resort in Manali') and I'll curate the best options for you. 🏖️✨"
        ];
        return pickVariant(fallbacks, this.recentHistory);
    }
}

const instance = new DynamicSynthesizer();
module.exports = instance;
