const prisma = require('../config/db');

const toValidDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const nightsBetween = (checkIn, checkOut) => {
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
};

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res, next) => {
    try {
        console.log("Fetching hotels from database...");
        const { city } = req.query;
        const whereClause = {};
        if (city && city !== "All" && city !== "India") {
            whereClause.city = { contains: city };
        }
        const hotels = await prisma.hotel.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                tagline: true,
                city: true,
                address: true,
                pricePerNight: true,
                starRating: true,
                guestRating: true,
                reviewCount: true,
                thumbnail: true,
                images: true,
                amenities: true,
                isFeatured: true,
                isTrending: true,
                isActive: true,
                qualityScore: true,
                room: true,
                coupon: true
            },
            take: 500
        });
        const count = hotels ? hotels.length : 0;
        console.log(`Found ${count} hotels.`);
        res.status(200).json({ success: true, count, data: hotels || [] });
    } catch (err) {
        console.error("DATABASE_ERROR:", err);
        res.status(500).json({ success: false, message: "Database Connection Error", error: err.message });
    }
};

// @desc    Advanced search for hotels with strong algorithm
// @route   GET /api/hotels/search
// @access  Public
exports.searchHotels = async (req, res, next) => {
    try {
        const { 
            city, 
            checkIn, 
            checkOut, 
            adults, 
            children, 
            rooms, 
            stayType,
            page,
            limit,
            minPrice,
            maxPrice,
            starRatings,
            guestRatingMin,
            amenities,
            searchQuery,
            sort
        } = req.query;
        const totalGuests = parseInt(adults || 2) + parseInt(children || 0);
        const requiredRooms = parseInt(rooms || 1);
        const checkInDate = toValidDate(checkIn);
        const checkOutDate = toValidDate(checkOut);
        if (checkInDate) checkInDate.setUTCHours(0, 0, 0, 0);
        if (checkOutDate) checkOutDate.setUTCHours(0, 0, 0, 0);
        const hasStayDates = checkInDate && checkOutDate && checkOutDate > checkInDate;
        const nights = hasStayDates ? nightsBetween(checkInDate, checkOutDate) : 1;

        // 1. Initial Filtering by City and Room Capacity
        const whereClause = {};

        let linkedHotelIds = null;
        if (req.query.destination_index !== undefined || req.query.collection_index !== undefined) {
            try {
                const configRows = await prisma.homepage_config.findMany();
                const config = {};
                configRows.forEach(row => {
                    try {
                        config[row.key] = JSON.parse(row.value);
                    } catch (_) {
                        config[row.key] = row.value;
                    }
                });

                if (req.query.destination_index !== undefined) {
                    const destIndex = parseInt(req.query.destination_index);
                    if (config.destinations && config.destinations[destIndex] && config.destinations[destIndex].linkedHotelIds) {
                        linkedHotelIds = config.destinations[destIndex].linkedHotelIds.map(id => parseInt(id));
                    }
                } else if (req.query.collection_index !== undefined) {
                    const collIndex = parseInt(req.query.collection_index);
                    if (config.collections && config.collections[collIndex] && config.collections[collIndex].linkedHotelIds) {
                        linkedHotelIds = config.collections[collIndex].linkedHotelIds.map(id => parseInt(id));
                    }
                }
            } catch (err) {
                console.error("Error reading homepage config for search filtering:", err);
            }
        }

        if (linkedHotelIds !== null && linkedHotelIds.length > 0) {
            whereClause.id = { in: linkedHotelIds };
        } else {
            if (city && city !== "All" && city !== "India") {
                const searchTerms = city.trim().split(/\s+/).filter(Boolean);
                if (searchTerms.length > 1) {
                    whereClause.AND = searchTerms.map(term => ({
                        OR: [
                            { name: { contains: term } },
                            { city: { contains: term } },
                            { address: { contains: term } }
                        ]
                    }));
                } else if (searchTerms.length === 1) {
                    const singleTerm = searchTerms[0];
                    whereClause.OR = [
                        { city: { contains: singleTerm } },
                        { address: { contains: singleTerm } },
                        { name: { contains: singleTerm } }
                    ];
                }
            }
        }

        // Must have rooms that can fit the guests AND match stay type
        const hasExplicitAdults = req.query.adults !== undefined && req.query.adults !== null && req.query.adults !== '';
        const roomFilter = {};
        if (hasExplicitAdults) {
            const perRoomCap = Math.ceil(totalGuests / requiredRooms);
            roomFilter.maxOccupancy = { gte: perRoomCap };
        }
        if (stayType === 'hourly') {
            roomFilter.isHourlyEnabled = true;
        } else if (stayType === 'nightly') {
            roomFilter.isHourlyEnabled = false;
        }
        // stayType undefined/both => no extra filter (show all)
        whereClause.room = { some: roomFilter };

        // Extra Filters
        if (minPrice || maxPrice) {
            whereClause.pricePerNight = {};
            if (minPrice) {
                whereClause.pricePerNight.gte = parseFloat(minPrice);
            }
            if (maxPrice && maxPrice !== 'Infinity' && maxPrice !== '50000') {
                whereClause.pricePerNight.lte = parseFloat(maxPrice);
            }
        }

        if (starRatings) {
            const ratings = starRatings.split(',').map(r => parseInt(r.trim())).filter(Number.isInteger);
            if (ratings.length > 0) {
                whereClause.starRating = { in: ratings };
            }
        }

        if (guestRatingMin) {
            whereClause.guestRating = { gte: parseFloat(guestRatingMin) };
        }

        if (amenities) {
            const amenityList = amenities.split(',').map(a => a.trim()).filter(Boolean);
            if (amenityList.length > 0) {
                if (!whereClause.AND) {
                    whereClause.AND = [];
                } else if (!Array.isArray(whereClause.AND)) {
                    whereClause.AND = [whereClause.AND];
                }
                amenityList.forEach(amenity => {
                    whereClause.AND.push({
                        amenities: { contains: amenity }
                    });
                });
            }
        }

        if (searchQuery) {
            const cleanQuery = searchQuery.trim();
            if (cleanQuery) {
                if (!whereClause.AND) {
                    whereClause.AND = [];
                } else if (!Array.isArray(whereClause.AND)) {
                    whereClause.AND = [whereClause.AND];
                }
                whereClause.AND.push({
                    OR: [
                        { name: { contains: cleanQuery } },
                        { city: { contains: cleanQuery } },
                        { address: { contains: cleanQuery } }
                    ]
                });
            }
        }

        const hotels = await prisma.hotel.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                tagline: true,
                city: true,
                address: true,
                pricePerNight: true,
                starRating: true,
                guestRating: true,
                reviewCount: true,
                thumbnail: true,
                images: true,
                amenities: true,
                isFeatured: true,
                isTrending: true,
                isActive: true,
                qualityScore: true,
                room: true,
                coupon: true
            }
        });

        const availableHotels = [];

        if (hasStayDates && hotels.length > 0) {
            const roomIds = hotels.flatMap(h => h.room.map(r => r.id));

            // Bulk fetch daily rates
            const allRates = await prisma.dailyrate.findMany({
                where: {
                    roomId: { in: roomIds },
                    date: {
                        gte: checkInDate,
                        lt: checkOutDate
                    }
                }
            });

            const rateMap = {};
            allRates.forEach(rate => {
                const dateKey = rate.date.toISOString().split('T')[0];
                rateMap[`${rate.roomId}_${dateKey}`] = rate;
            });

            // Bulk fetch bookings
            const allBookings = await prisma.booking.findMany({
                where: {
                    roomId: { in: roomIds },
                    checkIn: { lt: checkOutDate },
                    checkOut: { gt: checkInDate },
                    OR: [
                        { status: { in: ['confirmed', 'checked-in', 'paid'] } },
                        {
                            AND: [
                                { status: 'held' },
                                { holdExpiresAt: { gt: new Date() } }
                            ]
                        }
                    ]
                }
            });

            const bookingsByRoom = {};
            roomIds.forEach(id => {
                bookingsByRoom[id] = [];
            });
            allBookings.forEach(booking => {
                if (bookingsByRoom[booking.roomId]) {
                    bookingsByRoom[booking.roomId].push(booking);
                }
            });

            for (const hotel of hotels) {
                let availableRoomTypes = hotel.room.filter(room => {
                    const hasExplicitAdults = req.query.adults !== undefined && req.query.adults !== null && req.query.adults !== '';
                    const perRoomCapacity = Math.ceil(totalGuests / requiredRooms);
                    const capacityOk = room.status !== 'inactive' && room.status !== 'maintenance' && (!hasExplicitAdults || room.maxOccupancy >= perRoomCapacity);
                    if (!capacityOk) return false;
                    if (stayType === 'hourly') return room.isHourlyEnabled === true;
                    if (stayType === 'nightly') return room.isHourlyEnabled !== true;
                    return true; // both or undefined
                });

                const checkedRooms = [];

                for (const room of availableRoomTypes) {
                    let minAvailable = room.totalInventory || 1;
                    let totalStayPrice = 0;

                    for (let i = 0; i < nights; i++) {
                        const currentDay = new Date(checkInDate);
                        currentDay.setUTCDate(currentDay.getUTCDate() + i);
                        currentDay.setUTCHours(0, 0, 0, 0);

                        const nextDay = new Date(currentDay);
                        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

                        const dayKey = currentDay.toISOString().split('T')[0];
                        const override = rateMap[`${room.id}_${dayKey}`];
                        const dayLimit = override ? override.available : (room.totalInventory || 1);

                        const bookings = (bookingsByRoom[room.id] || []).filter(b => {
                            return b.checkIn < nextDay && b.checkOut > currentDay;
                        });

                        const bookedCount = bookings.reduce((count, booking) => {
                            try {
                                if (booking.roomDetails) {
                                    const details = JSON.parse(booking.roomDetails);
                                    const roomInfo = details.find(item => parseInt(item.id) === room.id);
                                    if (roomInfo) return count + (parseInt(roomInfo.quantity) || 1);
                                }
                            } catch (err) {}
                            return count + 1;
                        }, 0);

                        minAvailable = Math.min(minAvailable, Math.max(0, dayLimit - bookedCount));
                        totalStayPrice += override ? override.price : room.pricePerNight;
                    }

                    if (minAvailable >= requiredRooms) {
                        checkedRooms.push({
                            ...room,
                            availableUnits: minAvailable,
                            dynamicPricePerNight: totalStayPrice / nights
                        });
                    }
                }

                availableRoomTypes = checkedRooms;

                if (availableRoomTypes.length > 0) {
                    availableHotels.push({
                        ...hotel,
                        room: availableRoomTypes,
                        lowestAvailablePrice: Math.min(...availableRoomTypes.map(room => room.dynamicPricePerNight || room.pricePerNight))
                    });
                }
            }
        } else {
            // No stay dates or no hotels
            for (const hotel of hotels) {
                let availableRoomTypes = hotel.room.filter(room => {
                    const hasExplicitAdults = req.query.adults !== undefined && req.query.adults !== null && req.query.adults !== '';
                    const perRoomCapacity = Math.ceil(totalGuests / requiredRooms);
                    const capacityOk = room.status !== 'inactive' && room.status !== 'maintenance' && (!hasExplicitAdults || room.maxOccupancy >= perRoomCapacity);
                    if (!capacityOk) return false;
                    if (stayType === 'hourly') return room.isHourlyEnabled === true;
                    if (stayType === 'nightly') return room.isHourlyEnabled !== true;
                    return true; // both or undefined
                });

                if (availableRoomTypes.length > 0) {
                    availableHotels.push({
                        ...hotel,
                        room: availableRoomTypes,
                        lowestAvailablePrice: Math.min(...availableRoomTypes.map(room => room.pricePerNight))
                    });
                }
            }
        }

        // 3. Sorting & Ranking
        let sortedHotels = [...availableHotels];

        if (sort === "price_asc") {
            sortedHotels.sort((a, b) => (a.lowestAvailablePrice || a.pricePerNight) - (b.lowestAvailablePrice || b.pricePerNight));
        } else if (sort === "price_desc") {
            sortedHotels.sort((a, b) => (b.lowestAvailablePrice || b.pricePerNight) - (a.lowestAvailablePrice || a.pricePerNight));
        } else if (sort === "rating") {
            sortedHotels.sort((a, b) => (b.guestRating || 0) - (a.guestRating || 0));
        } else {
            // Default "recommended": use rankScore
            sortedHotels = sortedHotels.map(hotel => {
                let rankScore = (hotel.qualityScore || 85) * 0.5;
                if (hotel.isFeatured) rankScore += 30;
                rankScore += (hotel.guestRating || 0) * 4;
                if (hotel.isTrending) rankScore += 10;
                return { ...hotel, rankScore };
            }).sort((a, b) => b.rankScore - a.rankScore);
        }

        // 4. In-Memory Pagination
        const totalCount = sortedHotels.length;
        const pageNum = parseInt(page || 1);
        const limitNum = parseInt(limit || 12);
        const skip = (pageNum - 1) * limitNum;
        const paginatedHotels = sortedHotels.slice(skip, skip + limitNum);

        res.status(200).json({ 
            success: true, 
            count: totalCount, 
            data: paginatedHotels,
            hasMore: (skip + limitNum) < totalCount
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const resolveHotelId = async (idOrSlug) => {
    if (!idOrSlug) return null;
    const parsedId = parseInt(idOrSlug);
    if (!isNaN(parsedId)) {
        return parsedId;
    }
    
    const hotels = await prisma.hotel.findMany({
        select: { id: true, name: true }
    });
    
    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };
    
    const target = hotels.find(h => slugify(h.name) === idOrSlug);
    return target ? target.id : null;
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = async (req, res, next) => {
    try {
        const hotelId = await resolveHotelId(req.params.id);
        if (!hotelId) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: {
                room: {
                    select: {
                        id: true, name: true, bedConfiguration: true,
                        sizeM2: true, maxOccupancy: true, pricePerNight: true,
                        minPrice: true, maxPrice: true, variants: true, roomPolicies: true,
                        weeklyDiscount: true, monthlyDiscount: true,
                        amenities: true, images: true, highlights: true, trustPoints: true,
                        description: true, hotelId: true,
                        createdAt: true, updatedAt: true,
                        isHourlyEnabled: true, hourlyRates: true
                    }
                },
                review: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        const formattedReviews = (hotel.review || []).map(r => ({
            ...r,
            reply: r.partnerReply
        }));

        const hotelData = {
            ...hotel,
            review: formattedReviews,
            reviews: formattedReviews
        };

        res.status(200).json({ success: true, data: hotelData });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Hotel Admin, Super Admin)
exports.createHotel = async (req, res, next) => {
    try {
        // Check if user is hotel_admin or super_admin
        if (req.user.role !== 'hotel_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to create a hotel' });
        }

        const { 
            name, tagline, description, city, address, pricePerNight, 
            starRating, thumbnail, images, amenities,
            dining, wellness, faqs, safety, policies, mainAmenities,
            isDraft
        } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: 'Property name is required' });
        }

        if (!city || !String(city).trim()) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }

        if (!address || !String(address).trim()) {
            return res.status(400).json({ success: false, message: 'Address is required' });
        }

        const draftMode = isDraft === true || isDraft === 'true';
        const safeJson = (value, fallback) => {
            if (value === undefined || value === null || value === '') return fallback;
            return typeof value === 'string' ? value : JSON.stringify(value);
        };

        const hotel = await prisma.hotel.create({
            data: {
                name: String(name).trim(),
                tagline: tagline || "New property setup in progress",
                description: description || "This property is being set up by the partner.",
                city: String(city).trim(),
                address: String(address).trim(),
                pricePerNight: parseFloat(pricePerNight) || 0,
                starRating: parseInt(starRating) || 3,
                thumbnail: thumbnail || null,
                images: safeJson(images, '[]'),
                amenities: safeJson(amenities, '[]'),
                dining: safeJson(dining, '[]'),
                wellness: safeJson(wellness, '[]'),
                faqs: safeJson(faqs, '[]'),
                safety: safeJson(safety, '[]'),
                policies: safeJson(policies, '[]'),
                mainAmenities: safeJson(mainAmenities, '[]'),
                isActive: draftMode ? false : true,
                badges: draftMode ? JSON.stringify(['Draft']) : undefined,
                userId: req.user.id
            },
        });

        res.status(201).json({ success: true, data: hotel });
    } catch (err) {
        console.error("CREATE_HOTEL_ERROR:", err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Hotel Admin, Super Admin)
exports.updateHotel = async (req, res, next) => {
    try {
        const rawId = req.params.id || req.body._hotelId || req.body.hotelId || req.body.id;
        const hotelId = parseInt(String(rawId || '0'));
        let hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Make sure user is hotel owner or super admin / admin / hotel admin
        if (hotel.userId !== req.user.id && !['super_admin', 'superadmin', 'admin', 'hotel_admin', 'partner'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this hotel' });
        }

        // Filter req.body to only include valid hotel fields
        const validFields = [
            'name', 'tagline', 'description', 'city', 'address', 
            'pricePerNight', 'starRating', 'thumbnail', 'images', 
            'amenities', 'isFeatured', 'isTrending', 'dining', 
            'wellness', 'faqs', 'safety', 'policies', 'hotelUsername',
            'mainAmenities', 'badges', 'bookingAcceptanceRate', 'cancellationRate',
            'complaintsCount', 'noShowRate', 'qualityScore', 'responseSpeed'
        ];

        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (validFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        // Ensure numeric fields are correctly typed
        if (updateData.pricePerNight !== undefined) updateData.pricePerNight = parseFloat(updateData.pricePerNight);
        if (updateData.starRating !== undefined) updateData.starRating = parseInt(updateData.starRating);
        if (updateData.qualityScore !== undefined) updateData.qualityScore = parseFloat(updateData.qualityScore);
        if (updateData.complaintsCount !== undefined) updateData.complaintsCount = parseInt(updateData.complaintsCount);
        if (updateData.bookingAcceptanceRate !== undefined) updateData.bookingAcceptanceRate = parseFloat(updateData.bookingAcceptanceRate);
        if (updateData.cancellationRate !== undefined) updateData.cancellationRate = parseFloat(updateData.cancellationRate);
        if (updateData.noShowRate !== undefined) updateData.noShowRate = parseFloat(updateData.noShowRate);

        // Ensure JSON fields are stringified if sent as objects
        const jsonFields = ['images', 'amenities', 'dining', 'wellness', 'faqs', 'safety', 'policies', 'mainAmenities', 'badges'];
        jsonFields.forEach(field => {
            if (updateData[field] && typeof updateData[field] !== 'string') {
                updateData[field] = JSON.stringify(updateData[field]);
            }
        });

        console.log("Updating hotel with data:", updateData);

        hotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: updateData
        });

        res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        console.error("UPDATE_HOTEL_ERROR:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update hotel", 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Hotel Admin, Super Admin)
exports.deleteHotel = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.id);
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Make sure user is hotel owner or super admin
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this hotel' });
        }

        await prisma.hotel.delete({
            where: { id: hotelId }
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get hotels for logged in admin
// @route   GET /api/hotels/my-hotels
// @access  Private (Hotel Admin, Super Admin)
exports.getMyHotels = async (req, res, next) => {
    try {
        const includeBookings = req.query.includeBookings === 'true';
        const light = req.query.light === 'true';

        const hotels = await prisma.hotel.findMany({
            where: { userId: req.user.id },
            include: { 
                room: {
                    select: {
                        id: true, name: true, bedConfiguration: true,
                        sizeM2: true, maxOccupancy: true, pricePerNight: true,
                        amenities: true, images: true, highlights: true, trustPoints: true,
                        description: true, hotelId: true,
                        variants: true, roomPolicies: true, minPrice: true, maxPrice: true,
                        weeklyDiscount: true, monthlyDiscount: true,
                        status: true, totalInventory: true, viewType: true, floorNumber: true,
                        isCornerRoom: true, capacityAdults: true, capacityChildren: true,
                        capacityInfants: true, extraMattress: true, extraBedCharge: true,
                        tags: true, isFeatured: true, displayPriority: true, videoUrl: true,
                        media360Url: true, minStay: true, maxStay: true, isInstantBooking: true,
                        advanceBookingDays: true, advancePayment: true, securityDeposit: true,
                        isRefundable: true, isTaxIncluded: true, weekendPricing: true,
                        seasonalPricing: true, addOns: true, petsAllowed: true,
                        smokingAllowed: true, alcoholAllowed: true, partyAllowed: true,
                        seoTitle: true, seoDescription: true, slug: true, isHourlyEnabled: true,
                        hourlyRates: true,
                        createdAt: true, updatedAt: true
                    }
                },
                review: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                ...(includeBookings ? { booking: {
                    include: {
                        user: { select: { name: true, email: true } },
                        room: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                } } : {})
            }
        });

        const hotelsWithRevenue = await Promise.all(hotels.map(async (hotel) => {
            const formattedReviews = (hotel.review || []).map(r => ({
                ...r,
                reply: r.partnerReply
            }));

            if (includeBookings) {
                const totalRevenue = (hotel.booking || [])
                    .filter(b => b.paymentStatus === 'paid')
                    .reduce((sum, b) => sum + b.totalPrice, 0);
                return { ...hotel, reviews: formattedReviews, totalRevenue };
            }

            if (light) {
                return { ...hotel, reviews: formattedReviews, totalRevenue: 0 };
            }

            const revenue = await prisma.booking.aggregate({
                where: { hotelId: hotel.id, paymentStatus: 'paid' },
                _sum: { totalPrice: true }
            });
            return { ...hotel, reviews: formattedReviews, totalRevenue: revenue._sum.totalPrice || 0 };
        }));

        res.status(200).json({
            success: true,
            count: hotelsWithRevenue.length,
            data: hotelsWithRevenue
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create review for hotel
// @route   POST /api/hotels/:id/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        // Check if hotel exists
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        // Check if user has already reviewed this hotel
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_hotelId: {
                    userId: req.user.id,
                    hotelId: hotelId
                }
            }
        });

        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this hotel' });
        }

        const cleanliness = req.body.cleanliness ? parseInt(req.body.cleanliness) : 5;
        const comfort = req.body.comfort ? parseInt(req.body.comfort) : 5;
        const location = req.body.location ? parseInt(req.body.location) : 5;
        const staff = req.body.staff ? parseInt(req.body.staff) : 5;
        const valueForMoney = req.body.valueForMoney ? parseInt(req.body.valueForMoney) : 5;

        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                cleanliness,
                comfort,
                location,
                staff,
                valueForMoney,
                userId: req.user.id,
                hotelId: hotelId
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        // Update hotel guestRating and reviewCount
        const reviews = await prisma.review.findMany({
            where: { hotelId: hotelId }
        });

        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = totalRating / reviews.length;

        await prisma.hotel.update({
            where: { id: hotelId },
            data: {
                guestRating: avgRating,
                reviewCount: reviews.length
            }
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reply to a review
// @route   POST /api/hotels/:hotelId/reviews/:reviewId/reply
// @access  Private (Hotel Admin, Super Admin)
exports.replyToReview = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const reviewId = parseInt(req.params.reviewId);
        const { reply } = req.body;

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        if (hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: { partnerReply: reply }
        });

        res.status(200).json({ success: true, data: updatedReview });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get dynamic search suggestions for cities and hotels
// @route   GET /api/hotels/search-suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query || !query.trim()) {
            return res.status(200).json({ success: true, data: [] });
        }

        const cleanQuery = query.trim().toLowerCase();

        // State to cities mapping
        const STATE_TO_CITIES = {
            "rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Ranthambore"],
            "himachal pradesh": ["Manali", "Shimla"],
            "himachal": ["Manali", "Shimla"],
            "uttar pradesh": ["Agra", "Varanasi"],
            "up": ["Agra", "Varanasi"],
            "uttarakhand": ["Bhimtal", "Rudrapur", "Haridwar"],
            "haryana": ["Gurugram"],
            "delhi": ["New Delhi", "Delhi"],
            "goa": ["Goa"]
        };

        // If query matches a state, return all cities of that state
        const matchedStateKey = Object.keys(STATE_TO_CITIES).find(key => key.includes(cleanQuery));
        let citySuggestions = [];
        if (matchedStateKey) {
            const cities = STATE_TO_CITIES[matchedStateKey];
            citySuggestions = cities.map(cityName => ({
                id: `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
                label: cityName,
                sublabel: `City in ${matchedStateKey.toUpperCase()}`,
                category: "city",
                emoji: "🏙️"
            }));
        } else {
            // 1. Fetch matching hotels to extract distinct cities or sub-cities/areas
            const matchingHotelsForCities = await prisma.hotel.findMany({
                where: {
                    OR: [
                        { city: { contains: cleanQuery } },
                        { address: { contains: cleanQuery } }
                    ],
                    isActive: true
                },
                select: {
                    city: true,
                    address: true
                },
                take: 30
            });

            const citiesSet = new Set();
            matchingHotelsForCities.forEach(h => {
                if (h.city && h.city.toLowerCase().includes(cleanQuery)) {
                    citiesSet.add(h.city.trim());
                } else if (h.address && h.address.toLowerCase().includes(cleanQuery)) {
                    const parts = h.address.split(',').map(p => p.trim());
                    const matchingPart = parts.find(p => p.toLowerCase().includes(cleanQuery));
                    if (matchingPart) {
                        const cleanPart = matchingPart.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
                        if (
                            cleanPart.length >= 3 && 
                            cleanPart.length <= 45 && 
                            !cleanPart.toLowerCase().includes(h.city.toLowerCase())
                        ) {
                            citiesSet.add(`${cleanPart}, ${h.city.trim()}`);
                        } else {
                            citiesSet.add(h.city.trim());
                        }
                    } else {
                        citiesSet.add(h.city.trim());
                    }
                }
            });

            citySuggestions = Array.from(citiesSet).map(cityName => ({
                id: `city-${cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                label: cityName,
                sublabel: "City / Area",
                category: "city",
                emoji: "🏙️"
            })).slice(0, 5);
        }

        // 2. Fetch matching hotels by name or city
        const matchingHotels = await prisma.hotel.findMany({
            where: {
                OR: [
                    { name: { contains: cleanQuery } },
                    { city: { contains: cleanQuery } }
                ],
                isActive: true
            },
            select: {
                id: true,
                name: true,
                city: true,
                thumbnail: true
            },
            take: 5
        });

        const hotelSuggestions = matchingHotels.map(h => ({
            id: String(h.id),
            label: h.name,
            sublabel: h.city || "India",
            category: "hotel",
            thumbnail: h.thumbnail || undefined,
            emoji: "🏨"
        }));

        const suggestions = [...citySuggestions, ...hotelSuggestions];

        res.status(200).json({ success: true, data: suggestions });
    } catch (err) {
        console.error("Error getting search suggestions:", err);
        res.status(500).json({ success: false, message: "Error getting suggestions", error: err.message });
    }
};

// Trigger deploy - fix paths and spaces in deploy.yml
