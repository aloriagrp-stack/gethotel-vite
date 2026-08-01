const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const prisma = require('../config/db');

const EXPORT_API_BASE = process.env.LISTING_AGENT_URL || 'http://localhost:4000/api/export';
const EXPORT_API_KEY = process.env.LISTING_AGENT_KEY || 'ghs-export-key-2024';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Download image from listing agent and save to GHS /uploads/
async function downloadAndSaveImage(imageUrl) {
    if (!imageUrl) return null;
    
    let targetUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
        targetUrl = `http://localhost:4000${imageUrl}`;
    }
    
    try {
        const ext = path.extname(imageUrl.split('?')[0]) || '.jpeg';
        const filename = `imported_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
        const destPath = path.join(UPLOADS_DIR, filename);

        const fileStream = fs.createWriteStream(destPath);
        
        await new Promise((resolve, reject) => {
            const client = targetUrl.startsWith('https') ? https : http;
            const req = client.get(targetUrl, (res) => {
                if (res.statusCode !== 200) {
                    return reject(new Error(`Failed to fetch image status: ${res.statusCode}`));
                }
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(true);
                });
            });
            req.on('error', (err) => {
                fs.unlink(destPath, () => {});
                reject(err);
            });
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Image download timeout'));
            });
        });

        return `/uploads/${filename}`;
    } catch (err) {
        console.warn('[Importer] Image download warning:', err.message, targetUrl);
        return imageUrl; // Fallback to raw URL
    }
}

let activeAgentBase = process.env.LISTING_AGENT_URL || 'http://localhost:4000/api/export';
let activePairingCode = process.env.LISTING_AGENT_KEY || 'ghs-export-key-2024';
let isPairedAndConnected = false;

// Helper to make API requests to Listing Agent using active key and url
async function fetchFromListingAgent(endpoint, params = {}, customBase = null, customKey = null) {
    const baseUrl = (customBase || activeAgentBase).trim().replace(/\/$/, '');
    const apiKey = (customKey || activePairingCode).trim();

    // Construct candidate URLs to match whatever path structure the Exporter uses
    const candidates = [];
    if (baseUrl.endsWith('/api/export')) {
        candidates.push(`${baseUrl}${endpoint}`);
        candidates.push(`${baseUrl.replace(/\/api\/export$/, '')}${endpoint}`);
    } else {
        candidates.push(`${baseUrl}/api/export${endpoint}`);
        candidates.push(`${baseUrl}${endpoint}`);
    }

    let lastError = null;
    for (const rawUrl of candidates) {
        try {
            const urlObj = new URL(rawUrl);
            urlObj.searchParams.append('api_key', apiKey);
            for (const [k, v] of Object.entries(params)) {
                if (v !== undefined && v !== null) {
                    urlObj.searchParams.append(k, v);
                }
            }

            const res = await fetch(urlObj.toString(), {
                headers: { 'x-api-key': apiKey }
            });
            if (res.ok) {
                return await res.json();
            } else {
                lastError = new Error(`Listing Agent API returned HTTP ${res.status}`);
            }
        } catch (err) {
            lastError = err;
        }
    }

    console.error(`[Importer] All candidate fetch attempts failed for ${endpoint}:`, lastError?.message);
    throw lastError || new Error(`Could not connect to Listing Agent on ${baseUrl}`);
}

/**
 * POST /api/admin/importer/verify-pairing
 * Step 1: Calls Exporter POST /api/pairing-verify (or /pairing-verify) with body { pairingCode }
 * Step 2: Fetches stats/hotels using verified pairing code as api_key
 */
exports.verifyPairingCode = async (req, res) => {
    try {
        const { agentUrl, pairingCode } = req.body;
        const rawBase = (agentUrl || 'http://localhost:4000').trim().replace(/\/$/, '');
        const targetCode = (pairingCode || 'ghs-export-key-2024').trim();

        // Extract host base e.g. http://localhost:4000
        const hostBase = rawBase.replace(/\/api\/export\/?$/, '');

        // Try candidate pairing verification endpoints
        const verifyCandidates = [
            `${hostBase}/api/pairing-verify`,
            `${hostBase}/pairing-verify`,
            `${rawBase}/pairing-verify`
        ];

        let verifyResult = null;
        let lastError = null;

        for (const endpointUrl of verifyCandidates) {
            try {
                const response = await fetch(endpointUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pairingCode: targetCode })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && (data.success === true || data.status === 'success' || data.verified === true)) {
                        verifyResult = data;
                        break;
                    }
                }
            } catch (err) {
                lastError = err;
            }
        }

        // Fallback: If pairing-verify endpoint not found, try /api/export/stats with api_key
        if (!verifyResult) {
            try {
                const stats = await fetchFromListingAgent('/stats', {}, rawBase, targetCode);
                if (stats) {
                    verifyResult = { success: true, agentStats: stats };
                }
            } catch (e) {
                /* fallback failed */
            }
        }

        if (!verifyResult) {
            isPairedAndConnected = false;
            return res.status(400).json({
                success: false,
                message: `Pairing failed: Invalid pairing code or Exporter Agent offline.`,
                isConnected: false
            });
        }

        // Step 1 Success -> Save active pairing config
        activeAgentBase = rawBase.endsWith('/api/export') ? rawBase : `${rawBase}/api/export`;
        activePairingCode = targetCode;
        isPairedAndConnected = true;

        // Step 2: Fetch stats with verified pairing code
        let agentStats = verifyResult.agentStats || null;
        if (!agentStats) {
            agentStats = await fetchFromListingAgent('/stats').catch(() => ({}));
        }

        res.json({
            success: true,
            message: 'Pairing code verified successfully! Importer connected to Exporter Agent.',
            isConnected: true,
            agentUrl: activeAgentBase,
            pairingCode: activePairingCode,
            agentStats: agentStats
        });

    } catch (error) {
        isPairedAndConnected = false;
        res.status(400).json({
            success: false,
            message: `Pairing failed: ${error.message}`,
            isConnected: false
        });
    }
};

/**
 * GET /api/admin/importer/stats
 * Returns Listing Agent stats + GHS imported status summary
 */
exports.getImporterStats = async (req, res) => {
    try {
        const stats = await fetchFromListingAgent('/stats');
        const totalInGhs = await prisma.hotel.count();
        isPairedAndConnected = true;
        
        res.json({
            success: true,
            isConnected: isPairedAndConnected,
            agentUrl: activeAgentBase,
            pairingCode: activePairingCode,
            agentStats: stats,
            ghsStats: {
                totalHotelsInGhs: totalInGhs
            }
        });
    } catch (error) {
        res.json({
            success: false,
            isConnected: false,
            agentUrl: activeAgentBase,
            pairingCode: activePairingCode,
            message: 'Listing Agent is currently disconnected or offline',
            error: error.message,
            ghsStats: {
                totalHotelsInGhs: await prisma.hotel.count().catch(() => 0)
            }
        });
    }
};

/**
 * GET /api/admin/importer/hotels
 * Returns available hotels from Listing Agent with GHS import status
 */
exports.getExportHotels = async (req, res) => {
    try {
        const { page = 1, limit = 50, since, city } = req.query;
        let endpoint = '/hotels';
        if (city) {
            endpoint = `/cities/${encodeURIComponent(city)}`;
        }
        
        const agentData = await fetchFromListingAgent(endpoint, { page, limit, since });
        const hotels = agentData.hotels || [];

        // Check which hotels are already imported in GHS
        const hotelNames = hotels.map(h => h.name);
        const existingGhsHotels = await prisma.hotel.findMany({
            where: {
                name: { in: hotelNames }
            },
            select: { id: true, name: true }
        });
        
        const existingNamesMap = new Set(existingGhsHotels.map(h => h.name.toLowerCase().trim()));

        const enrichedHotels = hotels.map(h => ({
            ...h,
            isAlreadyImported: existingNamesMap.has((h.name || '').toLowerCase().trim()),
            existingGhsId: existingGhsHotels.find(ex => ex.name.toLowerCase().trim() === (h.name || '').toLowerCase().trim())?.id || null
        }));

        res.json({
            success: true,
            page: agentData.page || parseInt(page),
            limit: agentData.limit || parseInt(limit),
            total: agentData.total || enrichedHotels.length,
            totalPages: agentData.totalPages || 1,
            exportedAt: agentData.exportedAt || new Date().toISOString(),
            hotels: enrichedHotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch export hotels from Listing Agent',
            error: error.message
        });
    }
};

/**
 * POST /api/admin/importer/import
 * Imports selected hotel IDs or array of hotel objects from Listing Agent into GHS
 */
exports.importHotels = async (req, res) => {
    try {
        const { hotelIds, hotelsToImport } = req.body;
        let sourceHotels = [];

        if (Array.isArray(hotelsToImport) && hotelsToImport.length > 0) {
            sourceHotels = hotelsToImport;
        } else if (Array.isArray(hotelIds) && hotelIds.length > 0) {
            // Fetch individual hotel details for each ID
            for (const id of hotelIds) {
                try {
                    const detail = await fetchFromListingAgent(`/hotels/${id}`);
                    if (detail && detail.hotel) {
                        sourceHotels.push(detail.hotel);
                    } else if (detail && detail.id) {
                        sourceHotels.push(detail);
                    }
                } catch (e) {
                    console.warn(`[Importer] Could not fetch detail for hotel ID ${id}:`, e.message);
                }
            }
        } else {
            // Default: Fetch page 1 of all published hotels
            const agentData = await fetchFromListingAgent('/hotels', { page: 1, limit: 50 });
            sourceHotels = agentData.hotels || [];
        }

        if (sourceHotels.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid hotels found to import.'
            });
        }

        // Get or create default Super Admin / Partner user for ownership
        let adminUser = await prisma.user.findFirst({
            where: { role: { in: ['admin', 'superadmin'] } }
        });
        if (!adminUser) {
            adminUser = await prisma.user.findFirst();
        }
        const defaultUserId = adminUser ? adminUser.id : 1;

        const results = [];
        let importedCount = 0;
        let failedCount = 0;

        for (const item of sourceHotels) {
            try {
                const hotelName = item.name || 'Unnamed Imported Hotel';
                const city = item.city || 'India';
                const address = item.address || city;
                const starRating = item.starRating || 4;
                const description = item.description || `${hotelName} is a premier stay destination located in ${city}.`;

                // Download Images
                const rawImages = item.images || [];
                const downloadedImageUrls = [];
                let coverImageUrl = null;

                for (const img of rawImages) {
                    const savedUrl = await downloadAndSaveImage(img.url || img.thumbnailUrl);
                    if (savedUrl) {
                        downloadedImageUrls.push(savedUrl);
                        if (img.isCover && !coverImageUrl) {
                            coverImageUrl = savedUrl;
                        }
                    }
                }

                if (!coverImageUrl && downloadedImageUrls.length > 0) {
                    coverImageUrl = downloadedImageUrls[0];
                }
                if (!coverImageUrl) {
                    coverImageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                }

                // Process Room Types
                const rawRoomTypes = item.roomTypes || [];
                let minBasePrice = item.pricePerNight || 3500;
                if (rawRoomTypes.length > 0) {
                    const roomPrices = rawRoomTypes.map(r => r.basePrice || 3500).filter(p => p > 0);
                    if (roomPrices.length > 0) {
                        minBasePrice = Math.min(...roomPrices);
                    }
                }

                // Create or Link Dedicated Partner User for Hotel Login
                const slugName = hotelName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const targetEmail = (item.email || `${slugName}@gethotelstays.com`).trim().toLowerCase();
                const targetPassword = (item.password || 'GhsHotel@2024').trim();

                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(targetPassword, salt);

                let hotelPartnerUser = await prisma.user.findUnique({
                    where: { email: targetEmail }
                });

                if (!hotelPartnerUser) {
                    hotelPartnerUser = await prisma.user.create({
                        data: {
                            name: hotelName,
                            email: targetEmail,
                            password: hashedPassword,
                            role: 'hotel_admin'
                        }
                    });
                } else {
                    hotelPartnerUser = await prisma.user.update({
                        where: { id: hotelPartnerUser.id },
                        data: {
                            password: hashedPassword,
                            role: 'hotel_admin'
                        }
                    });
                }

                // Create or Update Hotel in GHS DB
                const existingHotel = await prisma.hotel.findFirst({
                    where: { name: hotelName }
                });

                let savedHotel;
                const hotelPayload = {
                    name: hotelName,
                    description: description,
                    city: city,
                    address: address,
                    pricePerNight: minBasePrice,
                    starRating: starRating,
                    guestRating: item.guestRating || 4.5,
                    reviewCount: item.reviewCount || 12,
                    thumbnail: coverImageUrl,
                    images: JSON.stringify(downloadedImageUrls),
                    amenities: JSON.stringify(item.amenities || ["Free Wi-Fi", "AC", "Room Service", "Breakfast Included"]),
                    policies: JSON.stringify(item.policies || [{ title: "Cancellation", description: item.cancellationPolicy || "Free cancellation up to 24h before check-in" }]),
                    userId: hotelPartnerUser.id,
                    isActive: true,
                    isFeatured: starRating >= 4,
                    isTrending: true
                };

                if (existingHotel) {
                    savedHotel = await prisma.hotel.update({
                        where: { id: existingHotel.id },
                        data: hotelPayload
                    });
                } else {
                    savedHotel = await prisma.hotel.create({
                        data: hotelPayload
                    });
                }

                // Delete existing rooms and insert fresh imported rooms
                await prisma.room.deleteMany({
                    where: { hotelId: savedHotel.id }
                });

                if (rawRoomTypes.length > 0) {
                    for (const r of rawRoomTypes) {
                        let parsedAmenities = r.amenities;
                        if (typeof r.amenities === 'string') {
                            try { parsedAmenities = JSON.parse(r.amenities); } catch (e) { parsedAmenities = [r.amenities]; }
                        }

                        await prisma.room.create({
                            data: {
                                hotelId: savedHotel.id,
                                name: r.name || r.sourceName || "Standard Deluxe Room",
                                description: r.description || `${r.name || "Deluxe Room"} featuring modern amenities and comfortable bedding.`,
                                pricePerNight: r.basePrice || minBasePrice,
                                maxOccupancy: r.maxGuests || r.adults || 2,
                                bedConfiguration: r.bedType || "King / Twin Bed",
                                amenities: JSON.stringify(parsedAmenities || ["Wi-Fi", "Air Conditioning", "TV", "Ensuite Bathroom"]),
                                images: JSON.stringify(downloadedImageUrls.slice(0, 3)),
                                status: "active"
                            }
                        });
                    }
                } else {
                    // Create default room category if none provided
                    await prisma.room.create({
                        data: {
                            hotelId: savedHotel.id,
                            name: "Executive Deluxe Room",
                            description: "Spacious Deluxe Room with king bed and city view.",
                            pricePerNight: minBasePrice,
                            maxOccupancy: 2,
                            bedConfiguration: "King Bed",
                            amenities: JSON.stringify(["Wi-Fi", "Air Conditioning", "TV", "Breakfast Included"]),
                            images: JSON.stringify([coverImageUrl]),
                            status: "active"
                        }
                    });
                }

                importedCount++;
                results.push({
                    hotelId: item.id,
                    ghsHotelId: savedHotel.id,
                    name: savedHotel.name,
                    status: 'success',
                    imagesCount: downloadedImageUrls.length,
                    roomsCount: Math.max(1, rawRoomTypes.length)
                });
            } catch (err) {
                failedCount++;
                console.error(`[Importer] Failed to import hotel ${item.name}:`, err.message);
                results.push({
                    hotelId: item.id,
                    name: item.name,
                    status: 'failed',
                    error: err.message
                });
            }
        }

        res.json({
            success: true,
            importedCount,
            failedCount,
            totalProcessed: sourceHotels.length,
            results
        });

    } catch (error) {
        console.error('[Importer] Import error:', error);
        res.status(500).json({
            success: false,
            message: 'Import failed due to server error',
            error: error.message
        });
    }
};

/**
 * POST /api/admin/importer/sync
 * Syncs new hotels from Listing Agent since a given date
 */
exports.syncNewHotels = async (req, res) => {
    try {
        const { since } = req.body;
        const sinceDate = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const agentData = await fetchFromListingAgent('/hotels', { since: sinceDate, limit: 100 });
        const newHotels = agentData.hotels || [];

        if (newHotels.length === 0) {
            return res.json({
                success: true,
                message: `No new hotels found since ${sinceDate}`,
                importedCount: 0,
                results: []
            });
        }

        // Delegate to importHotels logic
        req.body.hotelsToImport = newHotels;
        return exports.importHotels(req, res);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Sync failed',
            error: error.message
        });
    }
};
