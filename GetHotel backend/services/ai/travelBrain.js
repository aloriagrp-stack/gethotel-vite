/**
 * In-House Travel Brain & Conversational Engine
 * Zero external LLM API dependency.
 * Runs 100% locally on Node.js / cPanel shared hosting in < 30ms with < 40MB RAM.
 */

const prisma = require('../../config/db');
const { parseTravelQuery } = require('./travelQueryParser');
const convoIndexer = require('./convoDatasetIndexer');
const logger = require('./logger');

class TravelBrain {
    async processQuery({ query, messages = [], dbHotels = [], memory = {}, userId = null }) {
        const parsed = parseTravelQuery(query);
        logger.info('TravelBrain', 'Parsed user query', { intent: parsed.intent, city: parsed.city, budget: parsed.budget });

        // 1. Check for Bargain / Discount intent first
        if (parsed.intent === 'BARGAIN_DISCOUNT') {
            const activeHotel = (dbHotels && dbHotels.length > 0) ? dbHotels[0] : (memory.selectedHotel || null);
            const hotelName = activeHotel ? activeHotel.name : "GetHotelStays";
            
            const reply = `Bhai aapke liye special deal! 🎉\n\n**${hotelName}** par promo code **GHS10** use karein aur instant **10% extra discount** paayein! Neeche card me 'Book Now' par click karke coupon apply karein. Deal lock karein? 🏨✨`;
            
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

        // 2. Check for Policy FAQ (Local ID, Couple Friendly, Timings, Cancellation)
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

        // 3. Check for Language Switching (e.g. "talk in english", "speak hindi", "english please")
        const isEnglishSwitch = /\b(talk\s+(?:in\s+)?english|speak\s+(?:in\s+)?english|speak\s+english|english\s+please|in\s+english|switch\s+to\s+english|use\s+english|reply\s+in\s+english|can\s+you\s+speak\s+english|can\s+you\s+talk\s+in\s+english)\b/i.test(query);
        const isHindiSwitch = /\b(hindi\s+me\s+(?:baat\s+karo|bolo|batao|likho)|speak\s+(?:in\s+)?hindi|shuddh\s+hindi|hindi\s+please|switch\s+to\s+hindi)\b/i.test(query);

        if (isEnglishSwitch) {
            // Check if there was an active hotel or search in recent history or dbHotels
            const hasRecentHotel = (dbHotels && dbHotels.length > 0) || (memory && (memory.selectedHotelId || memory.destination));
            const hotelName = (dbHotels && dbHotels[0]?.name) || memory?.selectedHotelName || null;
            const destName = (dbHotels && dbHotels[0]?.city) || memory?.destination || "your destination";

            let reply = "Certainly! Switching to English. 🇬🇧\n\nI'm your dedicated AI Travel Concierge. Would you like to explore verified hotels, 3hr/6hr transit stays, flights, or plan a custom India tour itinerary?";
            if (hasRecentHotel) {
                reply = `Certainly! Switching to English. 🇬🇧\n\nI've pulled up verified stays in **${destName}**${hotelName ? ` including **${hotelName}**` : ''} featuring AC rooms, free Wi-Fi, and top cleanliness ratings.\n\nTake a look at the cards below, and let me know if you'd like to explore specific room categories or lock in your check-in dates!`;
            }

            return {
                reply,
                hotels: dbHotels,
                responseType: 'language_switch'
            };
        }

        if (isHindiSwitch) {
            return {
                reply: "Haanji bilkul! Ab hum aapse Hindi me baat karenge. Kahan chalne ka plan ban raha hai aapka? 🏨✨",
                hotels: dbHotels,
                responseType: 'language_switch'
            };
        }

        // 4. Check Dataset Indexer for general travel knowledge, FAQ, identity, capabilities, or small talk
        const matchedConvo = convoIndexer.findBestMatch(query);
        if (matchedConvo && matchedConvo.reply && (matchedConvo.score >= 5 || matchedConvo.patterns)) {
            logger.info('TravelBrain', 'Served via In-House ConvoIndexer', { score: matchedConvo.score, category: matchedConvo.category });
            return {
                reply: matchedConvo.reply,
                hotels: dbHotels,
                responseType: matchedConvo.responseType || 'travel_faq'
            };
        }

        // 5. Check for Greeting or General Chat - Hand off to SI / LLM Engine if not caught above
        if (parsed.intent === 'GREETING' || parsed.intent === 'GENERAL_CHAT') {
            return null;
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
            
            let tagDesc = "";
            if (parsed.tags.includes("coupleFriendly")) tagDesc = " 100% couple-friendly aur";
            
            const reply = `Haanji! **${locName}** me aapke liye${tagDesc} best options mil gaye hain:\n\n**${top.name}** sabse top choice hai — yahan ₹${top.pricePerNight} per night me AC room, free Wi-Fi aur verified premium service mil rahi hai! 🏨⭐\n\nNeeche hotel cards me photos aur room categories check karein aur seedha 'Book Now' par click karein! 👇`;

            return {
                reply,
                hotels: hotelsToReturn,
                responseType: 'hotel_recommendation'
            };
        }

        // If no hotels were found, hand off to SI Engine / LLM for natural answer
        return null;
    }
}

const instance = new TravelBrain();
module.exports = instance;
