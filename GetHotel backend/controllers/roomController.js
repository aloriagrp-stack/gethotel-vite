const prisma = require('../config/db');

// Strip undefined values from an object — Prisma rejects undefined even for nullable fields
const stripUndefined = (obj) => {
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
        if (val !== undefined) clean[key] = val;
    }
    return clean;
};

// Bulletproof JSON Normalizer
const normalizeJsonField = (data) => {
    if (!data) return "[]";
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return JSON.stringify(parsed);
        } catch (e) {
            if (data.includes(',')) return JSON.stringify(data.split(',').map(s => s.trim()).filter(Boolean));
            return JSON.stringify([data]);
        }
    }
    return JSON.stringify(data);
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

// @desc    Get rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
    try {
        const hotelId = await resolveHotelId(req.params.hotelId);
        if (!hotelId) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }
        const { checkIn, checkOut } = req.query;

        const rooms = await prisma.room.findMany({
            where: { hotelId: hotelId }
        });

        let isStaySearch = false;
        let checkInDate, checkOutDate, nights;
        if (checkIn && checkOut && checkIn !== 'Dates' && checkOut !== 'Dates') {
            checkInDate = new Date(checkIn);
            checkOutDate = new Date(checkOut);
            if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && checkOutDate > checkInDate) {
                isStaySearch = true;
                nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            }
        }

        const roomsWithAvailability = [];

        for (const room of rooms) {
            let availableUnits = room.totalInventory || 1;
            let dynamicPricePerNight = null;

            if (isStaySearch) {
                // Fetch daily rates overrides for this room
                const rates = await prisma.dailyrate.findMany({
                    where: {
                        roomId: room.id,
                        date: {
                            gte: checkInDate,
                            lt: checkOutDate
                        }
                    }
                });

                const rateMap = {};
                rates.forEach(r => {
                    const dStr = r.date.toISOString().split('T')[0];
                    rateMap[dStr] = r;
                });

                let totalStayPrice = 0;
                let minAvailable = room.totalInventory || 1;

                // Day-by-day check
                for (let i = 0; i < nights; i++) {
                    const currentDay = new Date(checkInDate);
                    currentDay.setDate(currentDay.getDate() + i);
                    
                    const nextDay = new Date(currentDay);
                    nextDay.setDate(nextDay.getDate() + 1);

                    const dStr = currentDay.toISOString().split('T')[0];
                    const rateOverride = rateMap[dStr];

                    // Base limit for this night
                    const dayLimit = rateOverride !== undefined ? rateOverride.available : room.totalInventory;

                    // Query bookings overlapping this specific night
                    const activeBookingsOnNight = await prisma.booking.findMany({
                        where: {
                            roomId: room.id,
                            status: { in: ['confirmed', 'checked-in', 'paid', 'held'] },
                            checkIn: { lt: nextDay },
                            checkOut: { gt: currentDay },
                            OR: [
                                { status: 'confirmed' },
                                { status: 'checked-in' },
                                { status: 'paid' },
                                { 
                                    AND: [
                                        { status: 'held' },
                                        { holdExpiresAt: { gt: new Date() } }
                                    ]
                                }
                            ]
                        }
                    });

                    // Sum quantities
                    const bookedCount = activeBookingsOnNight.reduce((count, b) => {
                        try {
                            if (b.roomDetails) {
                                const details = JSON.parse(b.roomDetails);
                                const rInfo = details.find((ri) => parseInt(ri.id) === room.id);
                                if (rInfo) return count + (parseInt(rInfo.quantity) || 1);
                            }
                        } catch (e) {}
                        if (b.roomId === room.id) return count + 1;
                        return count;
                    }, 0);

                    const availableOnNight = Math.max(0, dayLimit - bookedCount);
                    minAvailable = Math.min(minAvailable, availableOnNight);

                    // Add price
                    totalStayPrice += rateOverride !== undefined ? rateOverride.price : room.pricePerNight;
                }

                availableUnits = minAvailable;
                dynamicPricePerNight = totalStayPrice / nights;
                const hasPromotion = rates.length > 0;

                roomsWithAvailability.push({
                    ...room,
                    availableUnits,
                    isAvailable: availableUnits > 0,
                    dynamicPricePerNight,
                    hasPromotion
                });
            } else {
                // FALLBACK TO STATIC SEARCH
                const activeBookings = await prisma.booking.findMany({
                    where: {
                        roomId: room.id,
                        status: { in: ['confirmed', 'checked-in', 'paid', 'held'] },
                        OR: [
                            { status: 'confirmed' },
                            { status: 'checked-in' },
                            { status: 'paid' },
                            { 
                                AND: [
                                    { status: 'held' },
                                    { holdExpiresAt: { gt: new Date() } }
                                ]
                            }
                        ]
                    }
                });

                const bookedCount = activeBookings.reduce((count, b) => {
                    try {
                        if (b.roomDetails) {
                            const details = JSON.parse(b.roomDetails);
                            const rInfo = details.find((ri) => parseInt(ri.id) === room.id);
                            if (rInfo) return count + (parseInt(rInfo.quantity) || 1);
                        }
                    } catch (e) {}
                    if (b.roomId === room.id) return count + 1;
                    return count;
                }, 0);

                availableUnits = Math.max(0, (room.totalInventory || 1) - bookedCount);

                roomsWithAvailability.push({
                    ...room,
                    availableUnits,
                    isAvailable: availableUnits > 0,
                    dynamicPricePerNight,
                    hasPromotion: false
                });
            }
        }

        res.status(200).json({ success: true, count: roomsWithAvailability.length, data: roomsWithAvailability });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add room to hotel
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private (Hotel Admin, Super Admin)
exports.addRoom = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        
        // Check if hotel exists and user is authorized
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && !['super_admin', 'superadmin', 'admin', 'hotel_admin', 'partner'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to add a room to this hotel' });
        }

        const { 
            name, description, pricePerNight, maxOccupancy, 
            bedConfiguration, sizeM2, amenities, images, 
            highlights, trustPoints, 
            minPrice, maxPrice, weeklyDiscount, monthlyDiscount, variants,
            isHourlyEnabled, hourlyRates,
            // New Fields
            status, totalInventory, viewType, floorNumber, isCornerRoom,
            capacityAdults, capacityChildren, capacityInfants, extraMattress, extraBedCharge,
            tags, isFeatured, displayPriority, videoUrl, media360Url,
            minStay, maxStay, isInstantBooking, advanceBookingDays,
            advancePayment, securityDeposit, isRefundable, isTaxIncluded,
            weekendPricing, seasonalPricing, addOns,
            petsAllowed, smokingAllowed, alcoholAllowed, partyAllowed,
            seoTitle, seoDescription, slug
        } = req.body;
        
        const roomName = (name || req.body.roomName || req.body.title || req.body.category || req.body.roomType || "Standard Room").trim();
        const roomDesc = (description !== undefined && description !== null && String(description).trim() !== "")
            ? String(description)
            : `${roomName} with modern amenities and comfortable bedding.`;

        const roomData = {
            hotelId: parseInt(hotelId),
            name: roomName,
            description: roomDesc,
            pricePerNight: Math.max(0, parseFloat(pricePerNight || req.body.price || req.body.basePrice) || 0),
            maxOccupancy: Math.max(1, parseInt(maxOccupancy || req.body.maxGuests || req.body.capacityAdults) || 2),
            bedConfiguration: bedConfiguration || req.body.bedType || "1 King Bed",
            sizeM2: parseInt(sizeM2) || 0,
            amenities: normalizeJsonField(amenities),
            images: normalizeJsonField(images),
            highlights: normalizeJsonField(highlights),
            trustPoints: normalizeJsonField(trustPoints),
            minPrice: parseFloat(minPrice) || 0,
            maxPrice: parseFloat(maxPrice) || 0,
            weeklyDiscount: parseInt(weeklyDiscount) || 0,
            monthlyDiscount: parseInt(monthlyDiscount) || 0,
            variants: normalizeJsonField(variants),
            isHourlyEnabled: isHourlyEnabled === true || isHourlyEnabled === 'true',
            hourlyRates: typeof hourlyRates === 'string' ? hourlyRates : JSON.stringify(hourlyRates || {}),

            // New Mappings
            status: status || 'active',
            totalInventory: Math.max(1, parseInt(totalInventory) || 1),
            viewType: viewType || null,
            floorNumber: (floorNumber !== undefined && floorNumber !== null && !isNaN(parseInt(floorNumber))) ? parseInt(floorNumber) : null,
            isCornerRoom: isCornerRoom === true || isCornerRoom === 'true',
            capacityAdults: Math.max(1, parseInt(capacityAdults) || 2),
            capacityChildren: parseInt(capacityChildren) || 0,
            capacityInfants: parseInt(capacityInfants) || 0,
            extraMattress: extraMattress === true || extraMattress === 'true',
            extraBedCharge: parseFloat(extraBedCharge) || 0,
            tags: normalizeJsonField(tags),
            isFeatured: isFeatured === true || isFeatured === 'true',
            displayPriority: parseInt(displayPriority) || 0,
            videoUrl: videoUrl || null,
            media360Url: media360Url || null,
            minStay: parseInt(minStay) || 1,
            maxStay: parseInt(maxStay) || 90,
            isInstantBooking: isInstantBooking !== false && isInstantBooking !== 'false',
            advanceBookingDays: parseInt(advanceBookingDays) || 0,
            advancePayment: parseInt(advancePayment) || 0,
            securityDeposit: parseFloat(securityDeposit) || 0,
            isRefundable: isRefundable !== false && isRefundable !== 'false',
            isTaxIncluded: isTaxIncluded === true || isTaxIncluded === 'true',
            weekendPricing: normalizeJsonField(weekendPricing),
            seasonalPricing: normalizeJsonField(seasonalPricing),
            addOns: normalizeJsonField(addOns),
            petsAllowed: petsAllowed === true || petsAllowed === 'true',
            smokingAllowed: smokingAllowed === true || smokingAllowed === 'true',
            alcoholAllowed: alcoholAllowed !== false && alcoholAllowed !== 'false',
            partyAllowed: partyAllowed === true || partyAllowed === 'true',
            seoTitle: seoTitle || null,
            seoDescription: seoDescription || null,
            slug: slug || `${roomName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${hotelId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        };

        const room = await prisma.room.create({
            data: stripUndefined(roomData)
        });

        res.status(201).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update room
// @route   PUT /api/hotels/:hotelId/rooms/:roomId
// @access  Private (Hotel Admin, Super Admin)
exports.updateRoom = async (req, res, next) => {
    try {
        const rawHotelId = req.params.hotelId || req.body._hotelId || req.body.hotelId;
        const rawRoomId = req.params.roomId || req.body._roomId || req.body.roomId || req.body.id;
        const hotelId = parseInt(String(rawHotelId || '0'));
        const roomId = parseInt(String(rawRoomId || '0'));

        // If roomId is missing or <= 0 (e.g. newly drafted room), seamlessly delegate to addRoom
        if (isNaN(roomId) || roomId <= 0) {
            console.log(`[roomController.updateRoom] Room ID is ${roomId}, routing to addRoom for hotelId ${hotelId}...`);
            return exports.addRoom(req, res, next);
        }
        
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && !['super_admin', 'superadmin', 'admin', 'hotel_admin', 'partner'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // SECURITY: Ensure room belongs to the hotel
        const roomToUpdate = await prisma.room.findUnique({ where: { id: roomId } });

        if (!roomToUpdate || roomToUpdate.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Room not found in this hotel' });
        }

        const { 
            name, description, pricePerNight, maxOccupancy, 
            bedConfiguration, sizeM2, amenities, images, 
            highlights, trustPoints,
            minPrice, maxPrice, weeklyDiscount, monthlyDiscount, variants,
            isHourlyEnabled, hourlyRates,
            // New Fields
            status, totalInventory, viewType, floorNumber, isCornerRoom,
            capacityAdults, capacityChildren, capacityInfants, extraMattress, extraBedCharge,
            tags, isFeatured, displayPriority, videoUrl, media360Url,
            minStay, maxStay, isInstantBooking, advanceBookingDays,
            advancePayment, securityDeposit, isRefundable, isTaxIncluded,
            weekendPricing, seasonalPricing, addOns,
            petsAllowed, smokingAllowed, alcoholAllowed, partyAllowed,
            seoTitle, seoDescription, slug
        } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (pricePerNight !== undefined) updateData.pricePerNight = parseFloat(pricePerNight);
        if (maxOccupancy !== undefined) updateData.maxOccupancy = parseInt(maxOccupancy);
        if (bedConfiguration !== undefined) updateData.bedConfiguration = bedConfiguration;
        if (sizeM2 !== undefined) updateData.sizeM2 = parseInt(sizeM2);
        
        if (amenities !== undefined) updateData.amenities = normalizeJsonField(amenities);
        if (images !== undefined) updateData.images = normalizeJsonField(images);
        if (highlights !== undefined) updateData.highlights = normalizeJsonField(highlights);
        if (trustPoints !== undefined) updateData.trustPoints = normalizeJsonField(trustPoints);
        
        if (minPrice !== undefined) updateData.minPrice = parseFloat(minPrice);
        if (maxPrice !== undefined) updateData.maxPrice = parseFloat(maxPrice);
        if (weeklyDiscount !== undefined) updateData.weeklyDiscount = parseInt(weeklyDiscount);
        if (monthlyDiscount !== undefined) updateData.monthlyDiscount = parseInt(monthlyDiscount);
        if (variants !== undefined) updateData.variants = normalizeJsonField(variants);
        
        if (isHourlyEnabled !== undefined) updateData.isHourlyEnabled = isHourlyEnabled === true || isHourlyEnabled === 'true';
        if (hourlyRates !== undefined) updateData.hourlyRates = typeof hourlyRates === 'string' ? hourlyRates : JSON.stringify(hourlyRates || {});

        // New Fields Updates
        if (status !== undefined) updateData.status = status;
        if (totalInventory !== undefined) updateData.totalInventory = parseInt(totalInventory);
        if (viewType !== undefined) updateData.viewType = viewType;
        if (floorNumber !== undefined) updateData.floorNumber = parseInt(floorNumber);
        if (isCornerRoom !== undefined) updateData.isCornerRoom = isCornerRoom === true || isCornerRoom === 'true';
        
        if (capacityAdults !== undefined) updateData.capacityAdults = parseInt(capacityAdults);
        if (capacityChildren !== undefined) updateData.capacityChildren = parseInt(capacityChildren);
        if (capacityInfants !== undefined) updateData.capacityInfants = parseInt(capacityInfants);
        if (extraMattress !== undefined) updateData.extraMattress = extraMattress === true || extraMattress === 'true';
        if (extraBedCharge !== undefined) updateData.extraBedCharge = parseFloat(extraBedCharge);
        
        if (tags !== undefined) updateData.tags = normalizeJsonField(tags);
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured === true || isFeatured === 'true';
        if (displayPriority !== undefined) updateData.displayPriority = parseInt(displayPriority);
        
        if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
        if (media360Url !== undefined) updateData.media360Url = media360Url;
        
        if (minStay !== undefined) updateData.minStay = parseInt(minStay);
        if (maxStay !== undefined) updateData.maxStay = parseInt(maxStay);
        if (isInstantBooking !== undefined) updateData.isInstantBooking = isInstantBooking === true || isInstantBooking === 'true';
        if (advanceBookingDays !== undefined) updateData.advanceBookingDays = parseInt(advanceBookingDays);
        
        if (advancePayment !== undefined) updateData.advancePayment = parseInt(advancePayment);
        if (securityDeposit !== undefined) updateData.securityDeposit = parseFloat(securityDeposit);
        if (isRefundable !== undefined) updateData.isRefundable = isRefundable === true || isRefundable === 'true';
        if (isTaxIncluded !== undefined) updateData.isTaxIncluded = isTaxIncluded === true || isTaxIncluded === 'true';
        
        if (weekendPricing !== undefined) updateData.weekendPricing = normalizeJsonField(weekendPricing);
        if (seasonalPricing !== undefined) updateData.seasonalPricing = normalizeJsonField(seasonalPricing);
        if (addOns !== undefined) updateData.addOns = normalizeJsonField(addOns);
        
        if (petsAllowed !== undefined) updateData.petsAllowed = petsAllowed === true || petsAllowed === 'true';
        if (smokingAllowed !== undefined) updateData.smokingAllowed = smokingAllowed === true || smokingAllowed === 'true';
        if (alcoholAllowed !== undefined) updateData.alcoholAllowed = alcoholAllowed === true || alcoholAllowed === 'true';
        if (partyAllowed !== undefined) updateData.partyAllowed = partyAllowed === true || partyAllowed === 'true';
        
        if (seoTitle !== undefined) updateData.seoTitle = seoTitle || null;
        if (seoDescription !== undefined) updateData.seoDescription = seoDescription || null;
        if (slug !== undefined) updateData.slug = slug || null;

        console.log(">>> UPDATING ROOM:", roomId);
        console.log(">>> DATA:", JSON.stringify(updateData, null, 2).slice(0, 500) + "...");

        const room = await prisma.room.update({
            where: { id: roomId },
            data: updateData
        });

        res.status(200).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/hotels/:hotelId/rooms/:roomId
// @access  Private (Hotel Admin, Super Admin)
exports.deleteRoom = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId);
        const roomId = parseInt(req.params.roomId);

        // Validate IDs before any DB calls
        if (isNaN(hotelId) || hotelId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid Hotel ID' });
        }
        if (isNaN(roomId) || roomId <= 0) {
            return res.status(200).json({ success: true, message: 'Unsaved room skipped' });
        }
        
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && !['super_admin', 'superadmin', 'admin', 'hotel_admin', 'partner'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // SECURITY: Ensure room belongs to the hotel
        const roomToDelete = await prisma.room.findUnique({ where: { id: roomId } });
        if (!roomToDelete || roomToDelete.hotelId !== hotelId) {
            return res.status(404).json({ success: false, message: 'Room not found in this hotel' });
        }

        await prisma.room.delete({
            where: { id: roomId }
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Bulk create/update/delete rooms for a hotel
// @route   POST /api/hotels/:hotelId/rooms/bulk
// @access  Private (Hotel Admin, Super Admin)
exports.bulkUpdateRooms = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.hotelId || req.body.hotelId || req.body._hotelId);
        const { rooms, deleteIds } = req.body;

        // Validate hotelId before any DB calls
        if (isNaN(hotelId) || hotelId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid Hotel ID' });
        }

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }

        if (hotel.userId !== req.user.id && !['super_admin', 'superadmin', 'admin', 'hotel_admin', 'partner'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to manage rooms for this hotel' });
        }

        // 1. Delete rooms
        if (Array.isArray(deleteIds) && deleteIds.length > 0) {
            await prisma.room.deleteMany({
                where: {
                    hotelId: hotelId,
                    id: { in: deleteIds }
                }
            });
        }

        // 2. Create/Update rooms
        const existingHotelRooms = await prisma.room.findMany({
            where: { hotelId: hotelId },
            select: { id: true }
        });
        const validHotelRoomIds = new Set(existingHotelRooms.map(rm => rm.id));

        const savedRooms = [];
        if (Array.isArray(rooms)) {
            for (const r of rooms) {
                const roomName = (r.name || r.roomName || r.title || r.category || r.roomType || "Standard Room").trim();
                const roomDesc = (r.description !== undefined && r.description !== null && String(r.description).trim() !== "")
                    ? String(r.description)
                    : `${roomName} with comfortable bedding and essential amenities.`;

                const roomData = {
                    name: roomName,
                    description: roomDesc,
                    pricePerNight: Math.max(0, parseFloat(r.pricePerNight || r.price || r.basePrice) || 0),
                    maxOccupancy: Math.max(1, parseInt(r.maxOccupancy || r.maxGuests || r.capacityAdults) || 2),
                    bedConfiguration: r.bedConfiguration || r.bedType || "1 King Bed",
                    sizeM2: parseInt(r.sizeM2) || 0,
                    amenities: normalizeJsonField(r.amenities),
                    images: normalizeJsonField(r.images),
                    highlights: normalizeJsonField(r.highlights),
                    trustPoints: normalizeJsonField(r.trustPoints),
                    status: r.status || 'active',
                    totalInventory: Math.max(1, parseInt(r.totalInventory) || 1),
                    isHourlyEnabled: r.isHourlyEnabled === true || r.isHourlyEnabled === 'true',
                    hourlyRates: typeof r.hourlyRates === 'string' ? r.hourlyRates : JSON.stringify(r.hourlyRates || {}),
                    
                    // Advanced room fields mappings
                    viewType: r.viewType || null,
                    floorNumber: (r.floorNumber !== undefined && r.floorNumber !== null && !isNaN(parseInt(r.floorNumber))) ? parseInt(r.floorNumber) : null,
                    isCornerRoom: r.isCornerRoom === true || r.isCornerRoom === 'true',
                    capacityAdults: Math.max(1, parseInt(r.capacityAdults) || 2),
                    capacityChildren: parseInt(r.capacityChildren) || 0,
                    capacityInfants: parseInt(r.capacityInfants) || 0,
                    extraMattress: r.extraMattress === true || r.extraMattress === 'true',
                    extraBedCharge: parseFloat(r.extraBedCharge) || 0,
                    tags: normalizeJsonField(r.tags),
                    isFeatured: r.isFeatured === true || r.isFeatured === 'true',
                    displayPriority: parseInt(r.displayPriority) || 0,
                    videoUrl: r.videoUrl || null,
                    media360Url: r.media360Url || null,
                    minStay: parseInt(r.minStay) || 1,
                    maxStay: parseInt(r.maxStay) || 90,
                    isInstantBooking: r.isInstantBooking !== false && r.isInstantBooking !== 'false',
                    advanceBookingDays: parseInt(r.advanceBookingDays) || 0,
                    advancePayment: parseInt(r.advancePayment) || 0,
                    securityDeposit: parseFloat(r.securityDeposit) || 0,
                    isRefundable: r.isRefundable !== false && r.isRefundable !== 'false',
                    isTaxIncluded: r.isTaxIncluded === true || r.isTaxIncluded === 'true',
                    weekendPricing: normalizeJsonField(r.weekendPricing),
                    seasonalPricing: normalizeJsonField(r.seasonalPricing),
                    addOns: normalizeJsonField(r.addOns),
                    petsAllowed: r.petsAllowed === true || r.petsAllowed === 'true',
                    smokingAllowed: r.smokingAllowed === true || r.smokingAllowed === 'true',
                    alcoholAllowed: r.alcoholAllowed !== false && r.alcoholAllowed !== 'false',
                    partyAllowed: r.partyAllowed === true || r.partyAllowed === 'true',
                    seoTitle: r.seoTitle || null,
                    seoDescription: r.seoDescription || null,
                    slug: r.slug || `${roomName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${hotelId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    variants: normalizeJsonField(r.variants)
                };

                const parsedRoomId = r.id ? parseInt(r.id) : NaN;
                const cleanData = stripUndefined(roomData);

                // Per-room try/catch — if one room fails, others still save
                try {
                    if (!isNaN(parsedRoomId) && validHotelRoomIds.has(parsedRoomId)) {
                        // Update existing room belonging to THIS hotel
                        const updated = await prisma.room.update({
                            where: { id: parsedRoomId },
                            data: cleanData
                        });
                        savedRooms.push(updated);
                    } else {
                        // Create brand new category for THIS hotel
                        const { id, ...createData } = cleanData;
                        const created = await prisma.room.create({
                            data: {
                                ...createData,
                                hotelId: hotelId
                            }
                        });
                        savedRooms.push(created);
                    }
                } catch (roomErr) {
                    console.error(`[bulkUpdateRooms] Failed to save room "${roomName}":`, roomErr.message);
                    // Continue with next room instead of aborting entire batch
                }
            }
        }

        res.status(200).json({ success: true, data: savedRooms, count: savedRooms.length });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Trigger deploy - fix paths and spaces in deploy.yml
