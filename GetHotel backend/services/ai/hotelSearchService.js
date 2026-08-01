const prisma = require('../../config/db');
const logger = require('./logger');

const KNOWN_CITIES = [
    'goa', 'jaipur', 'udaipur', 'shimla', 'manali', 'delhi', 'mumbai',
    'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'pune',
    'ahmedabad', 'agra', 'varanasi', 'rishikesh', 'haridwar', 'mussoorie',
    'nainital', 'dharamshala', 'dalhousie', 'srinagar', 'gulmarg', 'pahalgam',
    'sonamarg', 'leh', 'ladakh', 'jaisalmer', 'jodhpur', 'bikaner', 'mount abu',
    'ranchi', 'shillong', 'gangtok', 'darjeeling', 'coorg', 'munnar', 'alleppey',
    'kochi', 'trivandrum', 'andaman', 'lakshadweep', 'lonavala', 'mahabaleshwar',
    'khandala', 'panaji', 'margao', 'calangute', 'baga', 'anjuna', 'varca',
    'cavelossim', 'benaulim', 'colva', 'palolem', 'patnem', 'agonda'
];

/**
 * Extract destination candidates from messages
 */
function extractDestination(messages) {
    const allText = messages.map(m => (m.content || m.text || '').toLowerCase()).join(' ');
    // Exact match first
    for (const city of KNOWN_CITIES) {
        const regex = new RegExp(`\\b${city}\\b`, 'i');
        if (regex.test(allText)) {
            return city.charAt(0).toUpperCase() + city.slice(1);
        }
    }
    // Partial match
    for (const city of KNOWN_CITIES) {
        if (allText.includes(city)) {
            return city.charAt(0).toUpperCase() + city.slice(1);
        }
    }
    return null;
}

/**
 * Sanitize hotel data for AI context & frontend cards
 */
function sanitizeHotels(hotels) {
    return hotels.map(h => {
        let activeRooms = h.room || h.rooms || [];

        let cheapestPrice = h.pricePerNight || 2499;
        let promotionalPrice = null;

        if (activeRooms.length === 0) {
            const basePrice = h.pricePerNight || 2499;
            const promoPrice = Math.round(basePrice * 0.82); // 18% promotional discount
            activeRooms = [
                {
                    id: h.id * 100 + 1,
                    name: "Deluxe King Room",
                    pricePerNight: basePrice,
                    promotionalPrice: promoPrice,
                    maxOccupancy: 2,
                    description: "Spacious room with King Bed, AC, Free Wi-Fi, and City View.",
                    images: h.thumbnail ? [h.thumbnail] : ["https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=600&q=80"]
                },
                {
                    id: h.id * 100 + 2,
                    name: "Executive Suite",
                    pricePerNight: Math.round(basePrice * 1.35),
                    promotionalPrice: Math.round(basePrice * 1.15),
                    maxOccupancy: 3,
                    description: "Premium Luxury Suite with Living Area, Complimentary Breakfast, and Bathtub.",
                    images: h.thumbnail ? [h.thumbnail] : ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"]
                }
            ];
        }

        const processedRooms = activeRooms.map(r => {
            let parsedImages = [];
            try {
                parsedImages = Array.isArray(r.images) 
                    ? r.images 
                    : (typeof r.images === 'string' ? JSON.parse(r.images || "[]") : []);
            } catch {
                parsedImages = [];
            }

            let roomPromoPrice = r.promotionalPrice || null;
            const today = new Date().toISOString().split('T')[0];
            if (r.dailyrate && Array.isArray(r.dailyrate)) {
                let lowestOverride = Infinity;
                r.dailyrate.forEach(dr => {
                    const drDate = dr.date instanceof Date ? dr.date.toISOString().split('T')[0] : String(dr.date).split('T')[0];
                    if (drDate >= today && dr.price < lowestOverride) {
                        lowestOverride = dr.price;
                    }
                });
                if (lowestOverride < Infinity && lowestOverride < r.pricePerNight) {
                    roomPromoPrice = lowestOverride;
                }
            }

            // If no dailyrate override exists, set automatic 15% promotional discount tag for active room promo display
            if (!roomPromoPrice && r.pricePerNight) {
                roomPromoPrice = Math.round(r.pricePerNight * 0.85);
            }

            return {
                id: r.id,
                name: r.name,
                pricePerNight: r.pricePerNight,
                promotionalPrice: roomPromoPrice,
                maxOccupancy: r.maxOccupancy || 2,
                description: r.description || '',
                images: parsedImages.length > 0 ? parsedImages : (h.thumbnail ? [h.thumbnail] : ["https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=600&q=80"])
            };
        });

        // Find cheapest room price & promo price across all processed rooms
        let minRoomBase = Infinity;
        let minRoomPromo = Infinity;

        processedRooms.forEach(pr => {
            if (pr.pricePerNight && pr.pricePerNight < minRoomBase) {
                minRoomBase = pr.pricePerNight;
            }
            if (pr.promotionalPrice && pr.promotionalPrice < minRoomPromo) {
                minRoomPromo = pr.promotionalPrice;
            }
        });

        if (minRoomBase < Infinity) cheapestPrice = minRoomBase;
        if (minRoomPromo < Infinity && minRoomPromo < cheapestPrice) promotionalPrice = minRoomPromo;
        else promotionalPrice = Math.round(cheapestPrice * 0.85);

        return {
            id: h.id,
            name: h.name,
            city: h.city,
            thumbnail: h.thumbnail || null,
            slug: h.slug || null,
            description: (h.description || '').slice(0, 300),
            pricePerNight: cheapestPrice,
            promotionalPrice: promotionalPrice,
            starRating: h.starRating || 0,
            guestRating: h.guestRating || 0,
            reviewCount: h.reviewCount || 0,
            rooms: processedRooms,
            reviews: (h.review || h.reviews || []).map(rev => ({
                id: rev.id,
                rating: rev.rating,
                comment: rev.comment,
                userName: rev.user?.name || "Guest"
            })),
            amenities: (() => {
                try { return typeof h.amenities === 'string' ? JSON.parse(h.amenities) : (h.amenities || []); }
                catch { return []; }
            })(),
            mainAmenities: (() => {
                try { return typeof h.mainAmenities === 'string' ? JSON.parse(h.mainAmenities) : (h.mainAmenities || []); }
                catch { return []; }
            })(),
            isActive: h.isActive,
        };
    });
}

/**
 * Search hotels in database matching user query context
 */
async function searchHotelsInDatabase(messages) {
    const destination = extractDestination(messages);
    const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
    
    // Extract price condition if specified
    const priceUnderMatch = lastUserMsg.match(/(?:under|below|less than|max|budget)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    const maxPriceLimit = priceUnderMatch ? parseInt(priceUnderMatch[1]) : null;

    const whereClause = { isActive: true };

    if (destination) {
        whereClause.city = { contains: destination };
    }

    if (maxPriceLimit) {
        whereClause.pricePerNight = { lte: maxPriceLimit };
    }

    const HOTEL_SELECT_FIELDS = {
        id: true, name: true, city: true, description: true,
        pricePerNight: true, starRating: true, guestRating: true,
        reviewCount: true, amenities: true, mainAmenities: true, isActive: true,
        thumbnail: true,
        room: {
            where: { status: 'active' },
            select: {
                id: true, name: true, pricePerNight: true, maxOccupancy: true,
                images: true, description: true,
                dailyrate: {
                    where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
                    select: { date: true, price: true, available: true },
                    orderBy: { date: 'asc' },
                    take: 14
                }
            }
        },
        review: {
            select: { id: true, rating: true, comment: true, user: { select: { name: true } } },
            take: 5
        }
    };

    let dbHotels = [];
    try {
        dbHotels = await prisma.hotel.findMany({
            where: whereClause,
            select: HOTEL_SELECT_FIELDS,
            take: 25
        });
    } catch (err) {
        logger.warn('HotelSearch', 'DB query failed', { error: err.message });
        return { status: 'error', hotels: [], error: err.message };
    }

    if (dbHotels.length === 0) {
        return { status: 'no_results', hotels: [] };
    }

    return { status: 'success', hotels: sanitizeHotels(dbHotels) };
}

/**
 * Fetch hotels by explicit array of IDs
 */
async function fetchHotelsByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    try {
        const hotels = await prisma.hotel.findMany({
            where: {
                id: { in: ids },
                isActive: true
            },
            select: {
                id: true, name: true, city: true, description: true,
                pricePerNight: true, starRating: true, guestRating: true,
                reviewCount: true, amenities: true, mainAmenities: true, isActive: true,
                thumbnail: true,
                room: {
                    where: { status: 'active' },
                    select: {
                        id: true, name: true, pricePerNight: true, maxOccupancy: true,
                        images: true, description: true,
                        dailyrate: {
                            where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
                            select: { date: true, price: true, available: true },
                            orderBy: { date: 'asc' },
                            take: 14
                        }
                    }
                },
                review: {
                    select: { id: true, rating: true, comment: true, user: { select: { name: true } } },
                    take: 5
                }
            }
        });
        return sanitizeHotels(hotels);
    } catch (err) {
        logger.warn('HotelSearch', 'fetchHotelsByIds failed', { error: err.message });
        return [];
    }
}

module.exports = {
    KNOWN_CITIES,
    extractDestination,
    sanitizeHotels,
    searchHotelsInDatabase,
    fetchHotelsByIds
};
