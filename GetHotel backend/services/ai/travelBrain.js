/**
 * In-House Travel Brain & Conversational Engine
 * Zero external LLM API dependency.
 * Runs 100% locally on Node.js / cPanel shared hosting in < 30ms with < 40MB RAM.
 */

const prisma = require('../../config/db');
const { parseTravelQuery } = require('./travelQueryParser');
const convoIndexer = require('./convoDatasetIndexer');
const dynamicSynthesizer = require('./dynamicSynthesizer');
const logger = require('./logger');

class TravelBrain {
    async processQuery({ query, messages = [], dbHotels = [], memory = {}, userId = null }) {
        const parsed = parseTravelQuery(query);
        logger.info('TravelBrain', 'Parsed user query', { intent: parsed.intent, city: parsed.city, budget: parsed.budget });

        const qLower = query.toLowerCase().trim();

        // 1. Check for Bargain / Discount intent first
        if (parsed.intent === 'BARGAIN_DISCOUNT') {
            const activeHotel = (dbHotels && dbHotels.length > 0) ? dbHotels[0] : (memory.selectedHotel || null);
            const hotelName = activeHotel ? activeHotel.name : "GetHotelStays";
            
            const reply = `Great news! 🎉 You can use exclusive promo code **GHS10** for an instant **10% extra discount** on **${hotelName}**!\n\nSimply tap 'Book Now' on the card below and apply the code at checkout. Shall we lock in this special rate for you? 🏨✨`;
            
            return {
                reply,
                hotels: dbHotels,
                responseType: 'bargain_discount',
                action: {
                    type: 'APPLY_COUPON',
                    couponCode: 'GHS10',
                    discountPercent: 10
                }
            };
        }

        // 2. Check for Language Switching (e.g. "talk in english", "speak hindi", "english please")
        const isEnglishSwitch = /\b(talk\s+(?:in\s+)?english|speak\s+(?:in\s+)?english|speak\s+english|english\s+please|in\s+english|switch\s+to\s+english|use\s+english|reply\s+in\s+english|can\s+you\s+speak\s+english|can\s+you\s+talk\s+in\s+english)\b/i.test(query);
        const isHindiSwitch = /\b(hindi\s+me\s+(?:baat\s+karo|bolo|batao|likho)|speak\s+(?:in\s+)?hindi|shuddh\s+hindi|hindi\s+please|switch\s+to\s+hindi)\b/i.test(query);

        if (isEnglishSwitch || isHindiSwitch) {
            const recentHotelInfo = (dbHotels && dbHotels.length > 0) ? {
                city: dbHotels[0].city,
                name: dbHotels[0].name
            } : (memory?.selectedHotelId ? {
                city: memory.destination || "your destination",
                name: memory.selectedHotelName || null
            } : null);

            return {
                reply: dynamicSynthesizer.generateLanguageSwitch(isHindiSwitch ? 'hi' : 'en', recentHotelInfo),
                hotels: dbHotels,
                responseType: 'language_switch'
            };
        }

        // 3. Check for Identity & Personal Questions ("who are you", "who made you", "what's your name")
        const isIdentity = /\b(who\s+(?:are\s+you|created\s+you|made\s+you)|what\s+is\s+your\s+name|what'?s\s+your\s+name|tell\s+me\s+about\s+yourself|tu\s+kaun\s+hai|tera\s+naam\s+kya\s+hai|tum\s+kaun\s+ho)\b/i.test(qLower);
        if (isIdentity) {
            return {
                reply: dynamicSynthesizer.generateIdentity(),
                hotels: dbHotels,
                responseType: 'identity'
            };
        }

        // 4. Check for Capabilities ("what can you do for me", "what are your features", "how can you help")
        const isCapabilities = /\b(what\s+can\s+you\s+do|what\s+can\s+u\s+do|how\s+can\s+you\s+help|what\s+are\s+your\s+features|kya\s+kar\s+sakte\s+ho|kya\s+kya\s+kar\s+sakta|features|capabilities)\b/i.test(qLower);
        if (isCapabilities) {
            return {
                reply: dynamicSynthesizer.generateCapabilities(),
                hotels: dbHotels,
                responseType: 'capabilities'
            };
        }

        // 5. Check for Status / How Are You
        const isStatus = /\b(how\s+are\s+you|how\s+r\s+u|how\s+are\s+things|kya\s+haal\s+hai|kaise\s+ho|what'?s\s+up|wassup|how\s+do\s+you\s+do)\b/i.test(qLower);
        if (isStatus) {
            return {
                reply: dynamicSynthesizer.generateSmallTalk(),
                hotels: dbHotels,
                responseType: 'smalltalk'
            };
        }

        // 6. Check for Gratitude ("thank you", "thanks", "awesome", "great")
        const isGratitude = /\b(thanks?|thank\s+you|dhanyawad|shukriya|great|awesome|cool|perfect|thx|superb)\b/i.test(qLower) && qLower.split(' ').length <= 4;
        if (isGratitude) {
            return {
                reply: dynamicSynthesizer.generateGratitude(),
                hotels: dbHotels,
                responseType: 'gratitude'
            };
        }

        // 7. Check for Farewell ("bye", "goodbye", "see you")
        const isFarewell = /\b(bye|goodbye|alvida|see\s+you|good\s+night|tata)\b/i.test(qLower) && qLower.split(' ').length <= 3;
        if (isFarewell) {
            return {
                reply: dynamicSynthesizer.generateFarewell(),
                hotels: dbHotels,
                responseType: 'farewell'
            };
        }

        // 8. Check for Pure Greetings ("hi", "hello", "hey", "good morning")
        const isGreetingOnly = /^(hi|hello|hey|greetings|hola|namaste|good\s+(?:morning|afternoon|evening))\b/i.test(qLower) && qLower.split(' ').length <= 3;
        if (isGreetingOnly) {
            const userTurnsCount = messages.filter(m => m.role === 'user').length;
            return {
                reply: dynamicSynthesizer.generateGreeting(userTurnsCount > 1),
                hotels: dbHotels,
                responseType: 'greeting'
            };
        }

        // 9. Check Policy FAQ (Local ID, Couple Friendly, Timings, Cancellation)
        if (parsed.intent === 'POLICY_FAQ') {
            const matchedFaq = convoIndexer.findBestMatch(query);
            if (matchedFaq && matchedFaq.reply) {
                return {
                    reply: matchedFaq.reply,
                    hotels: dbHotels,
                    responseType: 'policy_faq'
                };
            }
        }

        // 10. Check Dataset Indexer for general travel knowledge (Weather, Trekking, Solo Safety)
        const matchedConvo = convoIndexer.findBestMatch(query);
        if (matchedConvo && matchedConvo.reply && (matchedConvo.score >= 5 || matchedConvo.patterns)) {
            logger.info('TravelBrain', 'Served via In-House ConvoIndexer', { score: matchedConvo.score, category: matchedConvo.category });
            return {
                reply: dynamicSynthesizer.generateTravelAdvice({
                    question: matchedConvo.query || query,
                    answer: matchedConvo.reply,
                    category: matchedConvo.category
                }),
                hotels: dbHotels,
                responseType: matchedConvo.responseType || 'travel_faq'
            };
        }

        // 6. Hotel & Room Search
        let hotelsToReturn = dbHotels || [];

        // If no hotels were passed in, query Prisma directly
        if (hotelsToReturn.length === 0 && (parsed.city || parsed.area || parsed.budget || parsed.tags.length > 0)) {
            try {
                const whereClause = { isActive: true };
                if (parsed.city) {
                    whereClause.city = { contains: parsed.city };
                }
                if (parsed.area) {
                    whereClause.OR = [
                        { address: { contains: parsed.area } },
                        { name: { contains: parsed.area } }
                    ];
                }

                const foundHotels = await prisma.hotel.findMany({
                    where: whereClause,
                    include: {
                        room: true
                    },
                    take: 5
                });

                if (foundHotels && foundHotels.length > 0) {
                    hotelsToReturn = foundHotels.map(h => {
                        const roomsList = Array.isArray(h.room) ? h.room : [];
                        const lowestRoomPrice = roomsList.length > 0
                            ? Math.min(...roomsList.map(r => r.pricePerNight))
                            : (h.pricePerNight || 1999);

                        return {
                            id: h.id,
                            name: h.name,
                            city: h.city,
                            address: h.address,
                            pricePerNight: lowestRoomPrice,
                            rating: h.starRating || 4.2,
                            imageUrl: h.coverImage || (Array.isArray(h.images) ? h.images[0] : null) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
                            amenities: Array.isArray(h.amenities) ? h.amenities : ["Free Wi-Fi", "Air Conditioning", "Room Service"],
                            rooms: h.rooms || []
                        };
                    });
                }
            } catch (err) {
                logger.warn('TravelBrain', 'Direct DB query failed', { error: err.message });
            }
        }

        // Build Natural Prose Reply only if we have high-confidence hotel matches
        if (hotelsToReturn.length > 0) {
            const top = hotelsToReturn[0];
            const locName = parsed.area || parsed.city || top.city || "Delhi";
            
            const reply = dynamicSynthesizer.generateHotelProse({
                location: locName,
                topHotel: top.name,
                price: top.pricePerNight,
                tags: parsed.tags || []
            });

            return {
                reply,
                hotels: hotelsToReturn,
                responseType: 'hotel_recommendation'
            };
        }

        // 7. General fallback if query is purely conversational
        return {
            reply: dynamicSynthesizer.generateFallback(query),
            hotels: [],
            responseType: 'general'
        };
    }
}

const instance = new TravelBrain();
module.exports = instance;
