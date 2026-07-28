/**
 * Hourly Stay Service — Micro-Stays (3hr, 6hr, 12hr transit rooms)
 */
const prisma = require('../../config/db');
const logger = require('./logger');

/**
 * Search hotels & rooms that support hourly micro-stays (3hr, 6hr, 12hr)
 * @param {Object} params - Search parameters (city, durationHrs, budget)
 */
async function searchHourlyStays({ city = null, durationHrs = 3, budget = null }) {
    logger.info('HourlyStayService', 'Searching hourly stays', { city, durationHrs, budget });

    try {
        const whereClause = {
            isActive: true,
            room: {
                some: {
                    status: 'active',
                    isHourlyEnabled: true
                }
            }
        };

        if (city) {
            whereClause.city = { contains: city.trim() };
        }

        const hotels = await prisma.hotel.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                city: true,
                starRating: true,
                guestRating: true,
                reviewCount: true,
                thumbnail: true,
                images: true,
                description: true,
                address: true,
                pricePerNight: true,
                room: {
                    where: {
                        status: 'active',
                        isHourlyEnabled: true
                    },
                    select: {
                        id: true,
                        name: true,
                        pricePerNight: true,
                        maxOccupancy: true,
                        images: true,
                        description: true,
                        isHourlyEnabled: true,
                        hourlyRates: true
                    }
                }
            },
            take: 10
        });

        // Format hourly options with parsed rates
        const formattedHotels = hotels.map(h => {
            const formattedRooms = (h.room || []).map(r => {
                let hourlyRates = {};
                if (r.hourlyRates) {
                    try {
                        hourlyRates = typeof r.hourlyRates === 'string' ? JSON.parse(r.hourlyRates) : r.hourlyRates;
                    } catch {
                        hourlyRates = {};
                    }
                }

                // Fallback pricing for 3hr/6hr/12hr if hourlyRates JSON is empty
                const rate3hr = Number(hourlyRates[3] || hourlyRates['3'] || Math.round(r.pricePerNight * 0.35));
                const rate6hr = Number(hourlyRates[6] || hourlyRates['6'] || Math.round(r.pricePerNight * 0.55));
                const rate12hr = Number(hourlyRates[12] || hourlyRates['12'] || Math.round(r.pricePerNight * 0.75));

                return {
                    id: r.id,
                    name: r.name,
                    maxOccupancy: r.maxOccupancy,
                    pricePerNight: r.pricePerNight,
                    isHourlyEnabled: true,
                    hourlyRates: {
                        3: rate3hr,
                        6: rate6hr,
                        12: rate12hr
                    },
                    selectedDurationHrs: durationHrs,
                    selectedHourlyPrice: durationHrs === 6 ? rate6hr : (durationHrs === 12 ? rate12hr : rate3hr)
                };
            });

            const lowestHourlyPrice = Math.min(...formattedRooms.map(r => r.selectedHourlyPrice || 499));

            return {
                id: h.id,
                name: h.name,
                city: h.city,
                starRating: h.starRating,
                guestRating: h.guestRating,
                reviewCount: h.reviewCount,
                thumbnail: h.thumbnail,
                address: h.address,
                isHourlyAvailable: true,
                pricePerNight: h.pricePerNight,
                hourlyPriceStarting: lowestHourlyPrice,
                rooms: formattedRooms
            };
        });

        logger.info('HourlyStayService', `Found ${formattedHotels.length} hourly stay hotels`);
        return formattedHotels;
    } catch (err) {
        logger.error('HourlyStayService', 'Search failed', { error: err.message });
        return [];
    }
}

module.exports = {
    searchHourlyStays
};
