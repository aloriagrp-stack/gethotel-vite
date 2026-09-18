const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const sharp = require('sharp');
const { sendBookingEmails } = require('../utils/emailService');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');
const bcrypt = require('bcryptjs');
const pythonEngineClient = require('../services/pythonEngineClient');
const inHouseParser = require('../services/inHouseParser');
const { processUserMessage, processUserMessageStream } = require('../services/ai/orchestrator');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// Helper to strip script/style/HTML tags to extract readable text content
const cleanHtmlText = (html) => {
    if (!html) return '';
    return html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// Helper to execute Gemini requests with retries and fallback models
const runGeminiWithFallback = async (genAI, options, executeFn) => {
    const modelsToTry = [
        options.model || "gemini-2.5-flash",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.1-pro-preview"
    ];
    const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));
    
    let lastError = null;
    for (const modelName of uniqueModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`[Gemini Helper] Retrying model ${modelName} (attempt ${attempt + 1})...`);
                } else {
                    console.log(`[Gemini Helper] Attempting with model: ${modelName}`);
                }
                const modelConfig = { ...options, model: modelName };
                const model = genAI.getGenerativeModel(modelConfig);
                
                const result = await executeFn(model);
                console.log(`[Gemini Helper] Success with model: ${modelName}`);
                return result;
            } catch (err) {
                console.error(`[Gemini Helper] Failed with model ${modelName} (attempt ${attempt + 1}):`, err.message);
                lastError = err;
                
                const isRateLimit = err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("limit"));
                if (isRateLimit && attempt < 1) {
                    console.log(`[Gemini Helper] Rate limit hit. Waiting 3000ms before retry...`);
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    break;
                }
            }
        }
    }
    throw lastError;
};

// Helper to persist structured reviews into DB and recalculate hotel ratings
const saveImportedReviewsToDb = async (hotelId, targetHotel, extractedReviews) => {
    const savedReviews = [];

    for (const rev of extractedReviews) {
        const cleanName = (rev.userName || 'guest').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'guest';
        const dummyEmail = `reviewer_${cleanName}_${Math.floor(Math.random() * 100000)}@gethotelstays.mock`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

        const dummyUser = await prisma.user.create({
            data: {
                name: rev.userName || 'Guest User',
                email: dummyEmail,
                password: hashedPassword,
                role: 'user',
                updatedAt: new Date()
            }
        });

        const cleanliness = Math.min(5, Math.max(1, parseInt(rev.cleanliness) || 5));
        const comfort = Math.min(5, Math.max(1, parseInt(rev.comfort) || 5));
        const location = Math.min(5, Math.max(1, parseInt(rev.location) || 5));
        const staff = Math.min(5, Math.max(1, parseInt(rev.staff) || 5));
        const valueForMoney = Math.min(5, Math.max(1, parseInt(rev.valueForMoney) || 5));

        const dbReview = await prisma.review.create({
            data: {
                rating: Math.min(5, Math.max(1, parseInt(rev.rating) || 5)),
                comment: rev.comment || "Good experience.",
                cleanliness,
                comfort,
                location,
                staff,
                valueForMoney,
                userId: dummyUser.id,
                hotelId: Number(hotelId),
                createdAt: rev.createdAt ? new Date(rev.createdAt) : new Date()
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });
        savedReviews.push(dbReview);
    }

    // Recalculate average guestRating and total reviewCount for target hotel
    const allReviews = await prisma.review.findMany({
        where: { hotelId: Number(hotelId) }
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? parseFloat((totalRating / allReviews.length).toFixed(1)) : 0;

    await prisma.hotel.update({
        where: { id: Number(hotelId) },
        data: {
            guestRating: avgRating,
            reviewCount: allReviews.length
        }
    });

    return { savedReviews, avgRating, totalReviews: allReviews.length };
};

/**
 * @desc    Suggest and parse room categories from text or URL using In-House Python Engine
 * @route   POST /api/admin/ai/suggest-rooms
 * @access  Private (Super Admin)
 */
exports.suggestRooms = async (req, res) => {
    try {
        const { hotelId, prompt, url, urls, history, existingRooms, newAttachedImages } = req.body;

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "hotelId is required" });
        }

        const targetHotel = await prisma.hotel.findUnique({
            where: { id: Number(hotelId) }
        });
        if (!targetHotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        // Intercept raw review import request
        const cleanPrompt = prompt && typeof prompt === 'string' ? prompt.trim() : '';
        const isReviewImport = cleanPrompt.toLowerCase().startsWith('review import');
        if (isReviewImport) {
            console.log(`[AI Copilot - In-House Engine] Intercepted review import request for hotelId: ${hotelId}`);
            let rawReviewData = cleanPrompt.slice(13).trim().replace(/^[:\-\s\=]+/, '').trim();
            if (!rawReviewData) {
                return res.status(200).json({
                    success: true,
                    reply: "No review text provided after 'review import:'. Please paste raw review text!",
                    rooms: []
                });
            }

            const isPythonUp = await pythonEngineClient.isHealthy();
            if (!isPythonUp) {
                return res.status(503).json({
                    success: false,
                    reply: "⚠️ In-House Python Engine is offline. Please launch 'run-python-engine.cmd' on port 8000.",
                    rooms: []
                });
            }

            const pyRes = await pythonEngineClient.importReviews({ hotelId, rawText: rawReviewData });
            const extractedReviews = (pyRes && Array.isArray(pyRes.data)) ? pyRes.data : [];

            if (extractedReviews.length === 0) {
                return res.status(200).json({
                    success: true,
                    reply: "No valid reviews could be extracted from the provided text. Please verify the format.",
                    rooms: []
                });
            }

            const { savedReviews, avgRating, totalReviews } = await saveImportedReviewsToDb(hotelId, targetHotel, extractedReviews);
            const previewLines = savedReviews.slice(0, 5).map(rev => `- **${rev.user?.name || rev.userName}** (⭐${rev.rating}): "${rev.comment.length > 80 ? rev.comment.slice(0, 80) + '...' : rev.comment}"`).join('\n');
            const previewText = savedReviews.length > 5 ? `\n${previewLines}\n- ...and **${savedReviews.length - 5} more reviews**.` : `\n${previewLines}`;

            const replyMessage = `Successfully structured and imported **${savedReviews.length} reviews** into **${targetHotel.name}**!\n\n**Preview:**\n${previewText}\n\nProperty average rating updated to **⭐${avgRating}** (${totalReviews} total reviews).`;

            return res.status(200).json({
                success: true,
                reply: replyMessage,
                count: savedReviews.length,
                data: [],
                clearAllRooms: false
            });
        }

        // Check if Python engine is healthy and available
        const isPythonUp = await pythonEngineClient.isHealthy();
        let pyResult = null;

        if (isPythonUp) {
            console.log(`[AI Copilot - In-House Engine] Suggesting rooms for hotel ${targetHotel.name} via Python Engine...`);
            pyResult = await pythonEngineClient.suggestRooms({
                hotelId: Number(hotelId),
                hotelName: targetHotel.name,
                prompt,
                url,
                urls,
                existingRooms,
                history,
                newAttachedImages
            });
        }

        // Graceful fallback to pure Node.js in-house NLP parser if Python service is offline on live server
        if (!pyResult || !pyResult.success) {
            console.log(`[AI Copilot - In-House Engine] Processing via In-House Node NLP Parser fallback...`);
            const fallbackRes = inHouseParser.parseInHousePrompt(prompt, existingRooms);
            pyResult = {
                success: true,
                reply: fallbackRes.reply,
                data: fallbackRes.data,
                clearAllRooms: fallbackRes.clearAllRooms || false
            };
        }

        // Map room variants with default policies & incremental IDs
        const processedRooms = (pyResult.data || []).map(room => {
            const rawVariants = Array.isArray(room.variants) ? room.variants : [];
            const processedVariants = rawVariants.length > 0 ? rawVariants : [
                {
                    id: 1,
                    mealPlan: "Room Only (EP)",
                    price: room.pricePerNight,
                    policy: "Free cancellation till 24h"
                },
                {
                    id: 2,
                    mealPlan: "Bed & Breakfast (CP)",
                    price: Math.round(room.pricePerNight * 1.18),
                    policy: "Free cancellation till 24h"
                }
            ];

            return {
                ...room,
                totalInventory: parseInt(room.totalInventory) || 5,
                sizeM2: parseInt(room.sizeM2) || 25,
                variants: processedVariants
            };
        });

        return res.status(200).json({
            success: true,
            reply: pyResult.reply,
            count: processedRooms.length,
            data: processedRooms,
            clearAllRooms: pyResult.clearAllRooms || false,
            searchQueries: pyResult.searchQueries || [],
            searchSources: pyResult.searchSources || []
        });

    } catch (err) {
        console.error("AI_SUGGEST_ROOMS_ERROR:", err);
        return res.status(500).json({
            success: false,
            message: `Engine error: ${err.message}`,
            reply: `⚠️ Error occurred: ${err.message}`
        });
    }
};

/**
 * @desc    Download an external image, upgrade it to high resolution, convert to WebP, and save locally
 * @route   POST /api/admin/ai/convert-webp
 * @access  Private (Super Admin)
 */
exports.convertWebP = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
            return res.status(400).json({ success: false, message: 'Invalid or missing imageUrl' });
        }

        // Strictly force highest resolution possible on Booking.com images
        let targetUrl = imageUrl;
        if (imageUrl.includes('booking.com') || imageUrl.includes('bstatic.com')) {
            // Replace /max300/ or /max500/ or /square60/ etc. with /max1024x768/
            targetUrl = imageUrl.replace(/\/(max300|max500|square60|max100|max200|max400)\//gi, '/max1024x768/');
        }

        // Support relative protocols
        if (targetUrl.startsWith('//')) {
            targetUrl = `https:${targetUrl}`;
        }

        console.log(`[WebP Converter] Fetching image from: ${targetUrl.slice(0, 100)}`);

        // Fetch image buffer
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(15000) // 15s timeout
        });

        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < 100) {
            throw new Error('Downloaded image buffer is too small or invalid');
        }

        // Generate unique hash filename
        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
        const filename = `webp_${Date.now()}_${hash}.webp`;

        // Ensure uploads folder exists
        const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }

        const filePath = path.join(UPLOADS_DIR, filename);

        // Convert to WebP using sharp with high quality compression (quality 90 for high crisp resolution)
        await sharp(buffer)
            .webp({ quality: 90 })
            .toFile(filePath);

        console.log(`[WebP Converter] Converted & saved locally: /uploads/${filename}`);

        res.status(200).json({
            success: true,
            localPath: `/uploads/${filename}`
        });

    } catch (err) {
        console.error('[WebP Converter Error]:' , err.message);
        res.status(500).json({
            success: false,
            message: `Failed to convert image to WebP: ${err.message}`
        });
    }
};

/* ------------------------------------------------------------------ */
/*  Public AI Chat (no auth required)                                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Known city list for destination detection                          */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Extract destination candidates from messages                       */
/* ------------------------------------------------------------------ */
function extractDestination(messages) {
    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    // Try exact match first
    for (const city of KNOWN_CITIES) {
        const regex = new RegExp(`\\b${city}\\b`, 'i');
        if (regex.test(allText)) {
            return city.charAt(0).toUpperCase() + city.slice(1);
        }
    }
    // Try partial match (e.g. "delhi" matches "New Delhi")
    for (const city of KNOWN_CITIES) {
        if (allText.includes(city)) {
            return city.charAt(0).toUpperCase() + city.slice(1);
        }
    }
    return null;
}

/* ------------------------------------------------------------------ */
/*  Sanitize hotel data for AI context                                 */
/* ------------------------------------------------------------------ */
function sanitizeHotels(hotels) {
    return hotels.map(h => {
        const activeRooms = h.room || [];

        // Calculate cheapest price considering daily rate overrides
        let cheapestPrice = h.pricePerNight;
        let promotionalPrice = null;

        if (activeRooms.length > 0) {
            cheapestPrice = Math.min(...activeRooms.map(r => r.pricePerNight));

            // Check if any room has active daily rate overrides with lower prices
            const today = new Date().toISOString().split('T')[0];
            let lowestOverridePrice = Infinity;
            activeRooms.forEach(r => {
                if (r.dailyrate && Array.isArray(r.dailyrate)) {
                    r.dailyrate.forEach(dr => {
                        const drDate = dr.date instanceof Date ? dr.date.toISOString().split('T')[0] : String(dr.date).split('T')[0];
                        if (drDate >= today && dr.price < lowestOverridePrice) {
                            lowestOverridePrice = dr.price;
                        }
                    });
                }
            });
            if (lowestOverridePrice < Infinity && lowestOverridePrice < cheapestPrice) {
                promotionalPrice = lowestOverridePrice;
            }
        }

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
            rooms: activeRooms.map(r => {
                let parsedImages = [];
                try {
                    parsedImages = Array.isArray(r.images) 
                        ? r.images 
                        : (typeof r.images === 'string' ? JSON.parse(r.images || "[]") : []);
                } catch {
                    parsedImages = [];
                }

                // Check for room-specific daily rate overrides
                let roomPromoPrice = null;
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

                return {
                    id: r.id,
                    name: r.name,
                    pricePerNight: r.pricePerNight,
                    promotionalPrice: roomPromoPrice,
                    maxOccupancy: r.maxOccupancy,
                    description: r.description || '',
                    images: parsedImages
                };
            }),
            reviews: (h.review || []).map(rev => ({
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
 * @desc    Public AI chat endpoint delegated to AI Orchestrator Layer
 * @route   POST /api/ai/chat
 * @access  Public
 */
exports.chat = async (req, res) => {
    const { messages, conversationId, sessionId } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.json({ success: true, reply: "Hello! I'm your AI travel assistant. How can I help you plan your trip today?", hotels: [] });
    }

    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (e) {
            // Ignore optional token decoding failures
        }
    }

    try {
        const { userMemory } = req.body;
        const result = await processUserMessage({ messages, userId, conversationId: conversationId || sessionId, userMemory });
        return res.json({
            success: true,
            reply: result.reply,
            hotels: result.hotels,
            cards: result.cards,
            responseType: result.responseType,
            workflowState: result.workflowState,
            nextRequiredSlot: result.nextRequiredSlot,
            nextQuestion: result.nextQuestion,
            conversationId: result.conversationId,
            memoryPersistence: result.memoryPersistence,
            action: result.action
        });
    } catch (err) {
        console.error('[AI Controller] Orchestrator execution error:', err.message);
        let userMessage = "Oops 😅 I had a small connection issue. Please try again in a moment.";
        if (err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("limit"))) {
            userMessage = "I'm receiving a lot of requests right now. Please wait a moment and try again! 🙏";
        }
        return res.json({
            success: true,
            reply: userMessage,
            hotels: [],
            responseType: 'general'
        });
    }
};

/**
 * @desc    Streaming AI Chat Conversation Endpoint (Server-Sent Events)
 * @route   POST /api/ai/chat/stream
 * @access  Public / Authenticated
 */
exports.chatStream = async (req, res) => {
    const { messages, conversationId, sessionId, userMemory } = req.body;
    let userId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (e) {}
    }

    // Set SSE HTTP Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    const sendEvent = (event, data) => {
        try {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            if (res.flush) res.flush();
        } catch (e) {}
    };

    try {
        const result = await processUserMessageStream({
            messages,
            userId,
            conversationId: conversationId || sessionId,
            userMemory,
            onToken: (token) => {
                sendEvent('token', { token });
            },
            onEvent: (event, payload) => {
                sendEvent(event, payload);
            }
        });

        // Send final done payload
        sendEvent('done', {
            success: true,
            reply: result.reply,
            hotels: result.hotels || [],
            tourPackage: result.tourPackage || null,
            flights: result.flights || null,
            cards: result.cards || [],
            responseType: result.responseType || 'general',
            workflowState: result.workflowState,
            nextRequiredSlot: result.nextRequiredSlot,
            conversationId: result.conversationId,
            action: result.action || null
        });

        res.end();
    } catch (err) {
        console.error('[AI Controller] Stream execution error:', err.message);
        sendEvent('token', { token: "I'm having a brief connection issue. Please try again! 🙏" });
        sendEvent('done', {
            success: false,
            reply: "I'm having a brief connection issue. Please try again! 🙏",
            hotels: [],
            responseType: 'general'
        });
        res.end();
    }
};

/**
 * @desc    Fetch rooms for a hotel directly from database (no LLM involved)
 * @route   POST /api/ai/rooms
 * @access  Public
 */
exports.getRooms = async (req, res) => {
    const { hotelId } = req.body;
    console.log('[AI Rooms] Request for hotelId:', hotelId);

    if (!hotelId) {
        return res.json({ success: false, message: "hotelId is required", rooms: [], hotelName: '' });
    }

    try {
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            select: {
                id: true, name: true, city: true, thumbnail: true,
                room: {
                    where: { status: 'active' },
                    select: {
                        id: true, name: true, pricePerNight: true,
                        maxOccupancy: true, images: true, description: true
                    }
                }
            }
        });

        if (!hotel) {
            console.log('[AI Rooms] Hotel not found for ID:', hotelId);
            return res.json({ success: false, message: "Hotel not found", rooms: [], hotelName: '' });
        }

        const rooms = (hotel.room || []).map(r => {
            let parsedImages = [];
            try {
                parsedImages = Array.isArray(r.images) 
                    ? r.images 
                    : (typeof r.images === 'string' ? JSON.parse(r.images || "[]") : []);
            } catch {
                parsedImages = [];
            }
            return {
                id: r.id,
                name: r.name,
                pricePerNight: r.pricePerNight,
                maxOccupancy: r.maxOccupancy,
                images: parsedImages,
                description: r.description || ''
            };
        });

        console.log(`[AI Rooms] Found ${rooms.length} rooms for ${hotel.name}`);
        return res.json({
            success: true,
            rooms,
            hotelName: hotel.name,
            hotelCity: hotel.city,
            hotelThumbnail: hotel.thumbnail
        });
    } catch (err) {
        console.error('[AI Rooms Error]:', err.message);
        return res.json({ success: false, message: err.message, rooms: [], hotelName: '' });
    }
};

/**
 * @desc    Scrape hotel reviews from external OTA page and insert into database
 * @route   POST /api/admin/ai/import-reviews
 * @access  Private (Super Admin)
 */
exports.debugHotels = async (req, res) => {
    try {
        const total = await prisma.hotel.count();
        const active = await prisma.hotel.count({ where: { isActive: true } });
        const byCity = await prisma.hotel.groupBy({ by: ['city'], where: { isActive: true }, _count: { id: true } });
        const sample = await prisma.hotel.findMany({ where: { isActive: true }, select: { id: true, name: true, city: true }, take: 10 });
        console.log('[AI Debug] total:', total, 'active:', active);
        return res.json({ success: true, totalHotels: total, activeHotels: active, byCity: byCity.map(c => ({ city: c.city, count: c._count.id })), sample });
    } catch (err) {
        console.error('[AI Debug Error]:', err.message);
        return res.json({ success: false, message: err.message });
    }
};


/**
 * @desc    Scrape hotel reviews from external OTA page or raw text and insert into database
 * @route   POST /api/admin/ai/import-reviews
 * @access  Private (Super Admin)
 */
exports.importReviews = async (req, res) => {
    try {
        const { hotelId, url, rawText } = req.body;

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "hotelId is required" });
        }

        const targetHotel = await prisma.hotel.findUnique({
            where: { id: Number(hotelId) }
        });
        if (!targetHotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        const isPythonUp = await pythonEngineClient.isHealthy();
        if (!isPythonUp) {
            return res.status(503).json({
                success: false,
                message: "In-House Python Engine is not running. Please launch 'run-python-engine.cmd' or ensure port 8000 is open."
            });
        }

        console.log(`[Import Reviews - In-House Engine] Extracting reviews for hotel ${targetHotel.name}...`);
        const pyRes = await pythonEngineClient.importReviews({ hotelId: Number(hotelId), url, rawText });

        if (!pyRes || !pyRes.success) {
            return res.status(400).json({
                success: false,
                message: pyRes?.message || "Failed to extract reviews from the provided URL or text."
            });
        }

        const extractedReviews = Array.isArray(pyRes.data) ? pyRes.data : [];
        if (extractedReviews.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No readable reviews could be extracted. Please check the URL format or paste review text."
            });
        }

        const { savedReviews, avgRating, totalReviews } = await saveImportedReviewsToDb(hotelId, targetHotel, extractedReviews);

        return res.status(200).json({
            success: true,
            message: `Successfully imported ${savedReviews.length} verified reviews for ${targetHotel.name}. Average rating is now ⭐${avgRating} (${totalReviews} total).`,
            data: savedReviews,
            count: savedReviews.length
        });

    } catch (err) {
        console.error("AI_IMPORT_REVIEWS_ERROR:", err);
        res.status(500).json({ success: false, message: "AI reviews import failed", error: err.message });
    }
};

/**
 * @desc    Onboard multiple hotels and their rooms from uploaded JSON files via Gemini AI parser
 * @route   POST /api/admin/ai/bulk-onboard-hotels
 * @access  Private (Super Admin)
 */
const getHistoryFilePath = () => {
    return path.join(__dirname, '..', 'uploads', 'bulk_onboard_history.json');
};

const readHistoryLog = () => {
    try {
        const file = getHistoryFilePath();
        if (fs.existsSync(file)) {
            const raw = fs.readFileSync(file, 'utf8');
            return JSON.parse(raw || '[]');
        }
    } catch (e) {
        console.error("Failed to read onboarding history log:", e);
    }
    return [];
};

const writeHistoryLog = (newEntries) => {
    try {
        const file = getHistoryFilePath();
        const dir = path.dirname(file);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const current = readHistoryLog();
        const updated = [...newEntries, ...current].slice(0, 1000); // limit to 1000 entries
        fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf8');
    } catch (e) {
        console.error("Failed to write onboarding history log:", e);
    }
};

/**
 * @desc    Preview/Parse bulk hotel uploads via In-House Python Engine (does not write to DB)
 * @route   POST /api/admin/ai/bulk-onboard-preview
 * @access  Private (Super Admin)
 */
exports.bulkOnboardPreview = async (req, res) => {
    try {
        const { files } = req.body;
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a non-empty array of files." });
        }

        if (files.length > 20) {
            return res.status(400).json({ success: false, message: "Maximum of 20 files are allowed per bulk onboarding batch." });
        }

        const isPythonUp = await pythonEngineClient.isHealthy();
        if (!isPythonUp) {
            return res.status(503).json({
                success: false,
                message: "In-House Python Engine is not running. Please launch 'run-python-engine.cmd' or ensure port 8000 is open."
            });
        }

        console.log(`[Bulk Onboard - In-House Engine] Normalizing ${files.length} files via Python engine...`);
        const pyRes = await pythonEngineClient.bulkOnboardPreview({ files });

        if (!pyRes || !pyRes.success) {
            return res.status(500).json({
                success: false,
                message: pyRes?.message || "Failed to generate bulk onboarding preview."
            });
        }

        const normalizedHotels = [];
        for (const normFile of (pyRes.hotels || [])) {
            if (!normFile.success || normFile.skipped) {
                normalizedHotels.push(normFile);
                continue;
            }

            const hotelName = normFile.hotel?.name || normFile.hotelName || "Partner Hotel";
            const partnerEmail = normFile.partner?.email || "";

            const existingHotel = await prisma.hotel.findFirst({
                where: { name: hotelName }
            });

            const existingUser = partnerEmail ? await prisma.user.findUnique({
                where: { email: partnerEmail }
            }) : null;

            if (existingHotel) {
                normFile.skipped = true;
                normFile.message = `Skipped: Hotel "${hotelName}" already exists in database (ID: #${existingHotel.id}).`;
            } else if (existingUser) {
                normFile.skipped = true;
                normFile.message = `Skipped: Partner user with email "${partnerEmail}" already exists.`;
            }

            normalizedHotels.push(normFile);
        }

        return res.status(200).json({
            success: true,
            totalFiles: files.length,
            validCount: normalizedHotels.filter(h => h.success && !h.skipped).length,
            hotels: normalizedHotels
        });

    } catch (err) {
        console.error("AI_BULK_ONBOARD_PREVIEW_ERROR:", err);
        return res.status(500).json({ success: false, message: "Failed to generate bulk onboarding preview", error: err.message });
    }
};

/**
 * @desc    Confirm and save approved bulk hotel registrations in database
 * @route   POST /api/admin/ai/bulk-onboard-confirm
 * @access  Private (Super Admin)
 */
exports.bulkOnboardConfirm = async (req, res) => {
    try {
        const { hotels } = req.body;
        if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a non-empty array of hotels to save." });
        }

        const results = [];
        const historyEntries = [];
        const bcrypt = require('bcryptjs');

        for (const item of hotels) {
            const fileName = item.fileName || "unnamed.json";
            const hName = item.hotelName;

            if (!item.success || item.skipped) {
                // If it was already skipped or failed in preview, keep status
                results.push({
                    fileName,
                    success: false,
                    skipped: item.skipped || false,
                    hotelName: hName,
                    message: item.message || "Skipped or failed in preview."
                });
                continue;
            }

            try {
                const { hotel, partner, rooms } = item;

                // Recheck duplicates to avoid concurrent duplicate creation
                const existingUser = await prisma.user.findUnique({
                    where: { email: partner.email }
                });

                const existingHotel = await prisma.hotel.findFirst({
                    where: {
                        name: hotel.name,
                        city: hotel.city
                    }
                });

                if (existingUser || existingHotel) {
                    let dupReason = "";
                    if (existingUser && existingHotel) {
                        dupReason = `User with email "${partner.email}" AND hotel with name "${hotel.name}" in city "${hotel.city}" already exist.`;
                    } else if (existingUser) {
                        dupReason = `User with email "${partner.email}" already exists.`;
                    } else {
                        dupReason = `Hotel with name "${hotel.name}" in city "${hotel.city}" already exists.`;
                    }

                    const skipMsg = `Skipped (Duplicate): ${dupReason}`;
                    results.push({
                        fileName,
                        success: false,
                        skipped: true,
                        hotelName: hotel.name,
                        email: partner.email,
                        password: partner.password,
                        phone: partner.phone,
                        message: skipMsg
                    });

                    historyEntries.push({
                        timestamp: new Date(),
                        fileName,
                        hotelName: hotel.name,
                        email: partner.email,
                        password: partner.password,
                        phone: partner.phone,
                        roomsCount: rooms?.length || 0,
                        status: 'duplicate_skipped',
                        message: skipMsg
                    });
                    continue;
                }

                // Hash Password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(partner.password, salt);

                // Run Prisma Transaction
                const creationResult = await prisma.$transaction(async (tx) => {
                    // Create User
                    const userNameStr = partner.name || hotel.name;
                    const finalUserName = partner.phone ? `${userNameStr} (${partner.phone})` : userNameStr;

                    const user = await tx.user.create({
                        data: {
                            name: finalUserName,
                            email: partner.email,
                            password: hashedPassword,
                            role: 'hotel_admin',
                            updatedAt: new Date()
                        }
                    });

                    // Create Hotel
                    const amenitiesStr = JSON.stringify(hotel.amenities || []);
                    const mainAmenitiesStr = JSON.stringify(hotel.mainAmenities || hotel.amenities || []);
                    const hPrice = parseFloat(hotel.pricePerNight) || 1500;
                    const hStars = parseInt(hotel.starRating) || 3;
                    const hotelUsername = partner.phone ? partner.phone : `${hotel.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;

                    const newHotel = await tx.hotel.create({
                        data: {
                            name: hotel.name,
                            tagline: hotel.tagline || `Welcome to ${hotel.name}`,
                            description: hotel.description || "Welcome to our property.",
                            city: hotel.city,
                            address: hotel.address,
                            pricePerNight: hPrice,
                            starRating: hStars,
                            thumbnail: null,
                            images: JSON.stringify([]),
                            amenities: amenitiesStr,
                            mainAmenities: mainAmenitiesStr,
                            isActive: true,
                            userId: user.id,
                            hotelUsername
                        }
                    });

                    // Create Wallet
                    await tx.hotelwallet.create({
                        data: {
                            hotelId: newHotel.id,
                            totalRevenue: 0,
                            availableBalance: 0,
                            pendingPayouts: 0,
                            commissionRate: 15,
                            updatedAt: new Date()
                        }
                    });

                    // Create Rooms
                    const createdRooms = [];
                    if (Array.isArray(rooms) && rooms.length > 0) {
                        for (const r of rooms) {
                            const rPrice = parseFloat(r.pricePerNight) || hPrice;
                            const rName = r.name || "Standard Room";
                            const rMaxOcc = parseInt(r.maxOccupancy) || 2;
                            const rBeds = r.bedConfiguration || "1 King Bed";
                            const rSize = parseInt(r.sizeM2) || 18;
                            const rInventory = parseInt(r.totalInventory) || 5;
                            const rAmenities = JSON.stringify(r.amenities || []);
                            const rDesc = r.description || `Premium ${rName} room category offering comfort and luxury amenities.`;

                            const epVariant = [
                                {
                                    id: 1,
                                    mealPlan: "Room Only (EP)",
                                    price: rPrice,
                                    policy: "Free cancellation till 24h"
                                }
                            ];

                            const newRoom = await tx.room.create({
                                data: {
                                    name: rName,
                                    pricePerNight: rPrice,
                                    maxOccupancy: rMaxOcc,
                                    bedConfiguration: rBeds,
                                    sizeM2: rSize,
                                    totalInventory: rInventory,
                                    amenities: rAmenities,
                                    images: JSON.stringify([]),
                                    description: rDesc,
                                    status: 'active',
                                    hotelId: newHotel.id,
                                    capacityAdults: rMaxOcc,
                                    variants: JSON.stringify(epVariant)
                                }
                            });
                            createdRooms.push(newRoom);
                        }
                    } else {
                        // Fallback Standard Room if no rooms list provided
                        const newRoom = await tx.room.create({
                            data: {
                                name: "Standard Room",
                                pricePerNight: hPrice,
                                maxOccupancy: 2,
                                bedConfiguration: "1 King Bed",
                                sizeM2: 18,
                                totalInventory: 5,
                                amenities: JSON.stringify([]),
                                images: JSON.stringify([]),
                                description: "Comfortable standard room category.",
                                status: 'active',
                                hotelId: newHotel.id,
                                capacityAdults: 2,
                                variants: JSON.stringify([{ id: 1, mealPlan: "Room Only (EP)", price: hPrice, policy: "Free cancellation till 24h" }])
                            }
                        });
                        createdRooms.push(newRoom);
                    }

                    return { user, hotel: newHotel, roomsCount: createdRooms.length };
                });

                // Audit log Admin activity
                const { logAdminActivity } = require('../utils/auditLogger');
                logAdminActivity(req.user, 'CREATE_PARTNER_AI_BULK', {
                    partnerId: creationResult.user.id,
                    hotelId: creationResult.hotel.id,
                    partnerEmail: partner.email
                }, req);

                results.push({
                    fileName,
                    success: true,
                    skipped: false,
                    hotelName: hotel.name,
                    email: partner.email,
                    password: partner.password,
                    phone: partner.phone,
                    roomsCount: creationResult.roomsCount,
                    message: "Onboarded successfully!"
                });

                historyEntries.push({
                    timestamp: new Date(),
                    fileName,
                    hotelName: hotel.name,
                    email: partner.email,
                    password: partner.password,
                    phone: partner.phone,
                    roomsCount: creationResult.roomsCount,
                    status: 'success',
                    message: "Onboarded successfully!"
                });

            } catch (fileErr) {
                console.error(`Error confirming file ${fileName}:`, fileErr);
                results.push({
                    fileName,
                    success: false,
                    skipped: false,
                    message: fileErr.message || "Failed to onboard hotel."
                });

                historyEntries.push({
                    timestamp: new Date(),
                    fileName,
                    hotelName: hName || "Unknown",
                    status: 'failed',
                    message: fileErr.message || "Failed to onboard hotel."
                });
            }
        }

        // Save history logs to local json file
        writeHistoryLog(historyEntries);

        res.status(200).json({
            success: true,
            results
        });

    } catch (err) {
        console.error("AI_BULK_ONBOARD_CONFIRM_ERROR:", err);
        res.status(500).json({ success: false, message: "AI bulk hotel onboarding confirmation failed", error: err.message });
    }
};

/**
 * @desc    Get bulk onboarding history logs
 * @route   GET /api/admin/ai/bulk-onboard-history
 * @access  Private (Super Admin)
 */
exports.bulkOnboardHistory = async (req, res) => {
    try {
        const history = readHistoryLog();
        res.status(200).json({
            success: true,
            history
        });
    } catch (err) {
        console.error("AI_BULK_ONBOARD_HISTORY_ERROR:", err);
        res.status(500).json({ success: false, message: "Failed to load bulk onboarding history", error: err.message });
    }
};

