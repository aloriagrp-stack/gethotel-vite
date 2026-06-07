const prisma = require('../config/db');

// Realistic mock locations for localhost testing
const MOCK_LOCATIONS = [
    { country: 'India', region: 'Goa', city: 'Panaji' },
    { country: 'India', region: 'Karnataka', city: 'Bangalore' },
    { country: 'India', region: 'Maharashtra', city: 'Mumbai' },
    { country: 'India', region: 'Delhi', city: 'New Delhi' },
    { country: 'India', region: 'Rajasthan', city: 'Jaipur' },
    { country: 'India', region: 'Kerala', city: 'Kochi' },
    { country: 'India', region: 'Tamil Nadu', city: 'Chennai' },
    { country: 'United States', region: 'California', city: 'Los Angeles' },
    { country: 'United Kingdom', region: 'England', city: 'London' },
    { country: 'UAE', region: 'Dubai', city: 'Dubai' },
];

const isLocalIp = (ip) => {
    return !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::ffff:127.0.0.1';
};

// @desc    Ping visitor (log visit)
// @route   POST /api/analytics/ping
// @access  Public
exports.ping = async (req, res) => {
    try {
        const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.socket?.remoteAddress
            || '127.0.0.1';

        const page = req.body?.page || '/';
        let location = { country: null, region: null, city: null };

        if (isLocalIp(rawIp)) {
            // Pick a pseudorandom mock location so dev dashboard looks rich
            const seed = Math.floor(Date.now() / 30000) % MOCK_LOCATIONS.length;
            location = MOCK_LOCATIONS[seed];
        } else {
            // Real IP → free geo lookup (no API key needed)
            try {
                const geoRes = await fetch(`http://ip-api.com/json/${rawIp}?fields=country,regionName,city`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    location = { country: geoData.country || null, region: geoData.regionName || null, city: geoData.city || null };
                }
            } catch (_) { /* silently ignore geo failures */ }
        }

        await prisma.visitor_log.create({
            data: {
                ip: rawIp.slice(0, 64),
                country: location.country,
                region: location.region,
                city: location.city,
                page: page.slice(0, 255),
            }
        });

        res.json({ success: true });
    } catch (err) {
        // Never fail the client for analytics
        res.json({ success: false });
    }
};

// @desc    Get full analytics summary for super admin
// @route   GET /api/admin/analytics
// @access  Private (super_admin)
exports.getAnalytics = async (req, res) => {
    try {
        const now = new Date();

        // === LIVE VISITORS: active in the last 5 minutes ===
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const liveVisitors = await prisma.visitor_log.count({
            where: { createdAt: { gte: fiveMinAgo } }
        });

        // === TOTAL UNIQUE VISITORS (all time) ===
        const totalVisitors = await prisma.visitor_log.count();

        // === DAILY TREND GRAPH: last 14 days ===
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const rawDailyLogs = await prisma.visitor_log.findMany({
            where: { createdAt: { gte: fourteenDaysAgo } },
            select: { createdAt: true }
        });

        // Group by date string
        const dailyMap = {};
        rawDailyLogs.forEach(v => {
            const dateStr = v.createdAt.toISOString().slice(0, 10);
            dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
        });

        const trendData = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const shortLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            trendData.push({ date: dateStr, label: shortLabel, visitors: dailyMap[dateStr] || 0 });
        }

        // === COUNTRY BREAKDOWN ===
        const countryRaw = await prisma.$queryRaw`
            SELECT country, COUNT(*) as cnt
            FROM visitor_log
            WHERE country IS NOT NULL
            GROUP BY country
            ORDER BY cnt DESC
            LIMIT 8
        `;
        const totalGeo = countryRaw.reduce((s, r) => s + Number(r.cnt), 0) || 1;
        const countryBreakdown = countryRaw.map(r => ({
            country: r.country,
            count: Number(r.cnt),
            percent: Math.round((Number(r.cnt) / totalGeo) * 100)
        }));

        // === STATE/REGION BREAKDOWN (India) ===
        const regionRaw = await prisma.$queryRaw`
            SELECT region, COUNT(*) as cnt
            FROM visitor_log
            WHERE country = 'India' AND region IS NOT NULL
            GROUP BY region
            ORDER BY cnt DESC
            LIMIT 8
        `;
        const totalRegion = regionRaw.reduce((s, r) => s + Number(r.cnt), 0) || 1;
        const regionBreakdown = regionRaw.map(r => ({
            region: r.region,
            count: Number(r.cnt),
            percent: Math.round((Number(r.cnt) / totalRegion) * 100)
        }));

        // === FINANCIAL STATS ===
        const totalBookings = await prisma.booking.count();
        const paidBookings = await prisma.booking.count({ where: { paymentStatus: 'paid' } });

        const grossResult = await prisma.booking.aggregate({
            _sum: { totalPrice: true, amountPaid: true },
            where: { paymentStatus: 'paid' }
        });

        const grossRevenue = grossResult._sum.totalPrice || 0;
        const amountCollectedOnline = grossResult._sum.amountPaid || 0;
                const platformProfit = amountCollectedOnline; // 12% paid online = platform's cut
        const outstandingAtHotel = grossRevenue - amountCollectedOnline;

        // === TOTAL HOTELS & USERS ===
        const totalHotels = await prisma.hotel.count();
        const totalUsers = await prisma.user.count({ where: { role: 'user' } });

        res.json({
            success: true,
            data: {
                visitors: {
                    live: liveVisitors,
                    total: totalVisitors,
                    trend: trendData,
                    countryBreakdown,
                    regionBreakdown,
                },
                finance: {
                    totalBookings,
                    paidBookings,
                    grossRevenue,
                    amountCollectedOnline,
                    platformProfit,
                    outstandingAtHotel,
                },
                overview: {
                    totalHotels,
                    totalUsers,
                }
            }
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
