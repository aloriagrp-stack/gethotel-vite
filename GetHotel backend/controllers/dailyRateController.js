const prisma = require('../config/db');


const getDailyRates = async (req, res) => {
    try {
        const { roomId, startDate, endDate } = req.query;
        
        if (!roomId || !startDate || !endDate) {
            return res.status(400).json({ message: "roomId, startDate, and endDate are required" });
        }

        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomId) },
            select: { totalInventory: true, pricePerNight: true }
        });
        if (!room) return res.status(404).json({ message: "Room not found" });

        const rates = await prisma.dailyrate.findMany({
            where: {
                roomId: parseInt(roomId),
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            }
        });

        const bookings = await prisma.booking.findMany({
            where: {
                roomId: parseInt(roomId),
                status: { in: ['paid', 'confirmed', 'checked-in', 'held'] },
                checkIn: { lte: new Date(endDate) },
                checkOut: { gt: new Date(startDate) }
            }
        });

        const start = new Date(startDate);
        const end = new Date(endDate);
        const resultRates = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const override = rates.find(r => r.date.toISOString().split('T')[0] === dateStr);
            const limit = override ? override.available : (room.totalInventory || 1);
            const price = override ? override.price : room.pricePerNight;

            let bookedCount = 0;
            const dDate = new Date(d);
            dDate.setHours(0,0,0,0);

            bookings.forEach(b => {
                const bCheckIn = new Date(b.checkIn);
                const bCheckOut = new Date(b.checkOut);
                bCheckIn.setHours(0,0,0,0);
                bCheckOut.setHours(0,0,0,0);

                if (bCheckIn <= dDate && bCheckOut > dDate) {
                    let qty = 1;
                    if (b.roomDetails) {
                        try {
                            const details = JSON.parse(b.roomDetails);
                            const roomDetail = details.find(rd => parseInt(rd.id) === parseInt(roomId));
                            if (roomDetail && roomDetail.quantity) qty = parseInt(roomDetail.quantity);
                        } catch (e) {}
                    }
                    bookedCount += qty;
                }
            });

            resultRates.push({
                id: override ? override.id : undefined,
                roomId: parseInt(roomId),
                date: dateStr,
                price: price,
                available: limit, // The limit/override
                remainingAvailable: Math.max(0, limit - bookedCount), // Actual available
                bookedCount: bookedCount,
                isOverride: !!override
            });
        }

        res.json({ data: resultRates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const bulkUpdateDailyRates = async (req, res) => {
    try {
        const { roomId, startDate, endDate, price, available, isBlocked } = req.body;

        if (!roomId || !startDate || !endDate) {
            return res.status(400).json({ message: "roomId, startDate, and endDate are required" });
        }

        // Check ownership
        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomId) },
            include: { hotel: true }
        });

        if (!room) return res.status(404).json({ message: "Room not found" });
        if (room.hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const results = [];

        // Loop through each day in the range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const updated = await prisma.dailyrate.upsert({
                where: {
                    roomId_date: {
                        roomId: parseInt(roomId),
                        date: new Date(dateStr)
                    }
                },
                update: {
                    price: price !== undefined ? parseFloat(price) : undefined,
                    available: isBlocked ? 0 : (available !== undefined ? parseInt(available) : undefined)
                },
                create: {
                    roomId: parseInt(roomId),
                    date: new Date(dateStr),
                    price: price !== undefined ? parseFloat(price) : room.pricePerNight,
                    available: isBlocked ? 0 : (available !== undefined ? parseInt(available) : 1)
                }
            });
            results.push({
                ...updated,
                date: updated.date.toISOString().split('T')[0]
            });
        }

        res.json({ success: true, message: `Updated ${results.length} dates`, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const updateDailyRate = async (req, res) => {
    try {
        const { roomId, date, price, available } = req.body;

        // Check ownership
        const room = await prisma.room.findUnique({
            where: { id: parseInt(roomId) },
            include: { hotel: true }
        });

        if (!room) return res.status(404).json({ message: "Room not found" });
        if (room.hotel.userId !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updated = await prisma.dailyrate.upsert({
            where: {
                roomId_date: {
                    roomId: parseInt(roomId),
                    date: new Date(date)
                }
            },
            update: {
                price: price !== undefined ? parseFloat(price) : undefined,
                available: available !== undefined ? parseInt(available) : undefined
            },
            create: {
                roomId: parseInt(roomId),
                date: new Date(date),
                price: price !== undefined ? parseFloat(price) : room.pricePerNight,
                available: available !== undefined ? parseInt(available) : 1
            }
        });

        res.json({ 
            success: true, 
            data: {
                ...updated,
                date: updated.date.toISOString().split('T')[0]
            } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDailyRates,
    updateDailyRate,
    bulkUpdateDailyRates
};
