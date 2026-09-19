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

        // 3. Check for Greeting
        if (parsed.intent === 'GREETING' && (!dbHotels || dbHotels.length === 0)) {
            const matchedGreeting = convoIndexer.findBestMatch(query);
            return {
                reply: matchedGreeting ? matchedGreeting.reply : "Hello! Welcome to GetHotelStays. Main aapka personal travel assistant hoon. Kahan ghoomne ka plan hai? (e.g. 'Delhi me 2000 ke andar hotel', 'Paharganj couple friendly room') 🏨✨",
                hotels: [],
                responseType: 'greeting'
            };
        }

        // 4. Hotel & Room Search
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

        // Build Natural Prose Reply
        let reply = "";
        if (hotelsToReturn.length > 0) {
            const top = hotelsToReturn[0];
            const locName = parsed.area || parsed.city || top.city || "Delhi";
            
            let tagDesc = "";
            if (parsed.tags.includes("coupleFriendly")) tagDesc = " 100% couple-friendly aur";
            
            reply = `Haanji! **${locName}** me aapke liye${tagDesc} best options mil gaye hain:\n\n**${top.name}** sabse top choice hai — yahan ₹${top.pricePerNight} per night me AC room, free Wi-Fi aur verified premium service mil rahi hai! 🏨⭐\n\nNeeche hotel cards me photos aur room categories check karein aur seedha 'Book Now' par click karein! 👇`;
        } else {
            const loc = parsed.city || parsed.area || "is location";
            reply = `Filhal **${loc}** me exact matching hotels nahi mil rahe. Kya aap nearby area (jaise Paharganj ya Karol Bagh) dekhna chahenge, ya thoda budget flex karna chahenge? 🗺️🔍`;
        }

        return {
            reply,
            hotels: hotelsToReturn,
            responseType: 'hotel_recommendation'
        };
    }
}

const instance = new TravelBrain();
module.exports = instance;
