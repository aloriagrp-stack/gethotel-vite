const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const sharp = require('sharp');
const { sendBookingEmails } = require('../utils/emailService');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
const { processUserMessage } = require('../services/ai/orchestrator');

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
        "gemini-2.0-flash",
        "gemini-1.5-flash"
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

/**
 * @desc    Suggest and parse room categories from text or URL using Gemini API
 * @route   POST /api/admin/ai/suggest-rooms
 * @access  Private (Super Admin)
 */
exports.suggestRooms = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: "Gemini API Key is not configured. Please add GEMINI_API_KEY to your backend .env file."
            });
        }

        const { hotelId, prompt, url, urls, history, existingRooms, newAttachedImages } = req.body;

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "hotelId is required" });
        }

        // Intercept raw review import request
        const cleanPrompt = prompt && typeof prompt === 'string' ? prompt.trim() : '';
        const isReviewImport = cleanPrompt.toLowerCase().startsWith('review import');
        if (isReviewImport) {
            console.log(`[AI Copilot] Intercepted review import request for hotelId: ${hotelId}`);
            let rawReviewData = cleanPrompt.slice(13).trim();
            // Clean leading separators like colons, hyphens, equals, spaces
            rawReviewData = rawReviewData.replace(/^[:\-\s\=]+/, '').trim();
            if (!rawReviewData) {
                return res.status(200).json({
                    success: true,
                    reply: "Aapne 'review import:' ke baad koi raw data nahi diya hai. Please raw reviews paste karein taaki main unhe parse karke import kar sakoon!",
                    rooms: []
                });
            }

            // Verify hotel exists
            const targetHotel = await prisma.hotel.findUnique({
                where: { id: Number(hotelId) }
            });
            if (!targetHotel) {
                return res.status(404).json({ success: false, message: "Hotel not found" });
            }

            // Setup Gemini AI to parse the reviews into standard structured JSON
            const genAI = new GoogleGenerativeAI(apiKey);
            const reviewSchemaConfig = {
                type: "object",
                properties: {
                    reviews: {
                        type: "array",
                        description: "List of extracted reviews from the raw text provided.",
                        items: {
                            type: "object",
                            properties: {
                                userName: { type: "string", description: "Full name or screen name of the reviewer. Generate realistic first/last initial names if anonymous or missing." },
                                rating: { type: "number", description: "Overall rating given out of 5 stars. Scale down to 1-5 if out of 10." },
                                comment: { type: "string", description: "Review comment content in natural English." },
                                cleanliness: { type: "number", description: "Cleanliness rating score from 1 to 5 (default 5)." },
                                comfort: { type: "number", description: "Comfort rating score from 1 to 5 (default 5)." },
                                location: { type: "number", description: "Location rating score from 1 to 5 (default 5)." },
                                staff: { type: "number", description: "Staff rating score from 1 to 5 (default 5)." },
                                valueForMoney: { type: "number", description: "Value for money rating score from 1 to 5 (default 5)." },
                                createdAt: { type: "string", description: "Review date in YYYY-MM-DD format (default is recent dates)." }
                            },
                            required: ["userName", "rating", "comment"]
                        }
                    }
                },
                required: ["reviews"]
            };

            const reviewSystemInstruction = `
You are an expert data extraction assistant. Your job is to extract customer review logs from the raw text provided by the user.
Extract all customer reviews present in the text (up to 50 reviews). Parse out reviewer name, ratings, individual subscore ratings (Cleanliness, Comfort, Location, Staff, Value For Money), comment/text, and date.
Return the output strictly in valid JSON format matching the schema rules.
`;

            const reviewStructPrompt = `
User raw review data:
${rawReviewData.slice(0, 40000)}

Please extract the reviews. Ensure they are structured as JSON.
`;

            console.log("[AI Copilot - Import Reviews] Calling Gemini 2.5 flash review parser...");
            const reviewResult = await runGeminiWithFallback(
                genAI,
                {
                    model: "gemini-2.5-flash",
                    systemInstruction: reviewSystemInstruction,
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: reviewSchemaConfig,
                        temperature: 0.2
                    }
                },
                (model) => model.generateContent(reviewStructPrompt)
            );
            const reviewJsonText = reviewResult.response.text();
            
            let parsedReviews = { reviews: [] };
            try {
                parsedReviews = JSON.parse(reviewJsonText);
            } catch (jsonErr) {
                console.error("Gemini failed to generate valid JSON for raw reviews:", reviewJsonText);
                throw new Error("AI did not return valid JSON structured reviews.");
            }

            const extractedReviews = Array.isArray(parsedReviews.reviews) ? parsedReviews.reviews : [];
            console.log(`[AI Copilot - Import Reviews] Extracted ${extractedReviews.length} reviews from raw data.`);

            if (extractedReviews.length === 0) {
                return res.status(200).json({
                    success: true,
                    reply: "Mujhe raw text me koi reviews nahi mile jinhe main import kar sakoon. Please review text format sahi se paste karein.",
                    rooms: []
                });
            }

            // Store reviews in local Database
            const bcrypt = require('bcryptjs');
            const savedReviews = [];

            for (const rev of extractedReviews) {
                const cleanName = rev.userName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'guest';
                const dummyEmail = `reviewer_${cleanName}_${Math.floor(Math.random() * 100000)}@gethotelstays.mock`;
                
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

                const dummyUser = await prisma.user.create({
                    data: {
                        name: rev.userName,
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

            console.log(`[AI Copilot - Import Reviews] Successfully saved ${savedReviews.length} reviews. Avg rating updated to ${avgRating}`);

            // Build premium conversational Hinglish response
            const previewLines = savedReviews.slice(0, 5).map(rev => `- **${rev.user?.name || rev.userName}** (⭐${rev.rating}): "${rev.comment.length > 80 ? rev.comment.slice(0, 80) + '...' : rev.comment}"`).join('\n');
            const previewText = savedReviews.length > 5 ? `\n${previewLines}\n- ...aur **${savedReviews.length - 5} aur reviews**.` : `\n${previewLines}`;

            const replyMessage = `Maine aapke raw data se successfully **${savedReviews.length} reviews** ko simplify aur structure karke **${targetHotel.name}** me import kar diya hai! Yahan ek chota preview hai:
${previewText}

Hotel ki average rating ab update hokar **⭐${avgRating}** (total ${allReviews.length} reviews) ho gayi hai.`;

            return res.status(200).json({
                success: true,
                reply: replyMessage,
                count: savedReviews.length,
                data: [], // empty rooms data since we only imported reviews
                clearAllRooms: false
            });
        }

        let contextText = "";
        let otaContext = "";
        let scrapedData = null;

        // Clean up and collect valid scraping URLs
        let activeUrls = [];
        if (Array.isArray(urls)) {
            activeUrls = urls.map(u => String(u).trim()).filter(u => u.startsWith('http'));
        } else if (url && String(url).startsWith('http')) {
            activeUrls = [String(url).trim()];
        }

        // Process URLs sequentially if any are provided
        if (activeUrls.length > 0) {
            try {
                const { detectOtaDetails } = require('./adminController');
                const targetHotel = await prisma.hotel.findUnique({
                    where: { id: Number(hotelId) }
                });
                const hotelName = targetHotel ? targetHotel.name : "Target Hotel";
                const basePrice = targetHotel ? targetHotel.pricePerNight : 2500;

                const scrapedHotels = [];
                for (const scrapingUrl of activeUrls) {
                    try {
                        console.log(`[AI Copilot] Scraping URL via detectOtaDetails: ${scrapingUrl}`);
                        const details = await detectOtaDetails(scrapingUrl, hotelName, basePrice);
                        if (details) {
                            scrapedHotels.push(details);
                        }
                    } catch (err) {
                        console.error(`[AI Copilot] Failed to scrape URL ${scrapingUrl}: ${err.message}`);
                    }
                }

                if (scrapedHotels.length > 0) {
                    // Merge room configurations by name similarity
                    const mergedRooms = [];
                    scrapedHotels.forEach(sh => {
                        if (Array.isArray(sh.rooms)) {
                            sh.rooms.forEach(r => {
                                const normName = r.name.toLowerCase().trim();
                                const existing = mergedRooms.find(mr => 
                                    mr.name.toLowerCase().trim() === normName || 
                                    mr.name.toLowerCase().trim().includes(normName) || 
                                    normName.includes(mr.name.toLowerCase().trim())
                                );
                                
                                if (!existing) {
                                    mergedRooms.push({ ...r });
                                } else {
                                    if (r.description && r.description.length > existing.description.length) {
                                        existing.description = r.description;
                                    }
                                    if (r.sizeM2 && r.sizeM2 > (existing.sizeM2 || 0)) {
                                        existing.sizeM2 = r.sizeM2;
                                    }
                                    if (r.maxOccupancy && r.maxOccupancy > existing.maxOccupancy) {
                                        existing.maxOccupancy = r.maxOccupancy;
                                    }
                                    // Union of room amenities
                                    const newRoomAmen = new Set([...(existing.amenities || []), ...(r.amenities || [])]);
                                    existing.amenities = Array.from(newRoomAmen);
                                    // Union of room images
                                    const newRoomImgs = new Set([...(existing.images || []), ...(r.images || [])]);
                                    existing.images = Array.from(newRoomImgs);
                                }
                            });
                        }
                    });

                    // Build merged scrapedData object
                    scrapedData = {
                        name: scrapedHotels[0].name,
                        description: scrapedHotels.map(h => h.description).filter(Boolean).reduce((a, b) => a.length > b.length ? a : b, ""),
                        address: scrapedHotels.map(h => h.address).filter(Boolean).reduce((a, b) => a.length > b.length ? a : b, ""),
                        rooms: mergedRooms
                    };

                    otaContext = `We scraped and merged room configurations from ${scrapedHotels.length} URLs:\n${JSON.stringify(scrapedData, null, 2)}\n`;
                    console.log(`[AI Copilot] Synced and merged OTA data context successfully parsed.`);
                }
            } catch (err) {
                console.error(`[AI Copilot] Failed to complete multi-link scraping: ${err.message}`);
            }
        }

        // Prepare existing rooms context from DB directly to include up-to-date dynamic daily rates!
        let existingRoomsContext = "";
        try {
            const dbRooms = await prisma.room.findMany({
                where: { hotelId: Number(hotelId) },
                include: {
                    dailyrate: {
                        where: {
                            date: {
                                gte: new Date(new Date().setHours(0,0,0,0))
                            }
                        },
                        orderBy: {
                            date: 'asc'
                        },
                        take: 30
                    }
                }
            });

            if (dbRooms && dbRooms.length > 0) {
                const simplifiedRooms = dbRooms.map(r => {
                    const activeOverrides = (r.dailyrate || []).map(dr => ({
                        date: dr.date.toISOString().split('T')[0],
                        priceOverride: dr.price,
                        availableOverride: dr.available
                    }));

                    return {
                        id: r.id,
                        name: r.name,
                        description: r.description,
                        pricePerNight: r.pricePerNight,
                        maxOccupancy: r.maxOccupancy,
                        bedConfiguration: r.bedConfiguration,
                        sizeM2: r.sizeM2,
                        totalInventory: r.totalInventory,
                        amenities: Array.isArray(r.amenities) ? r.amenities : (typeof r.amenities === 'string' ? JSON.parse(r.amenities || "[]") : []),
                        images: Array.isArray(r.images) ? r.images : (typeof r.images === 'string' ? JSON.parse(r.images || "[]") : []),
                        variants: typeof r.variants === 'string' ? JSON.parse(r.variants || "[]") : (Array.isArray(r.variants) ? r.variants : []),
                        activeDailyRateOverrides: activeOverrides
                    };
                });
                existingRoomsContext = `The hotel currently has the following existing rooms configured in the database (with dynamic daily rate overrides):\n${JSON.stringify(simplifiedRooms, null, 2)}\n`;
            }
        } catch (dbErr) {
            console.error("Failed to query dbRooms for context:", dbErr);
            // fallback to client-passed existingRooms if query fails
            if (Array.isArray(existingRooms) && existingRooms.length > 0) {
                existingRoomsContext = `The hotel currently has the following existing rooms configured in the database:\n${JSON.stringify(existingRooms, null, 2)}\n`;
            }
        }

        // Combine inputs
        let attachedImagesContext = "";
        if (Array.isArray(newAttachedImages) && newAttachedImages.length > 0) {
            attachedImagesContext = `The user has uploaded/attached the following new high-resolution optimized WebP images:\n${JSON.stringify(newAttachedImages, null, 2)}\n`;
        }

        const userInput = `
${prompt ? `Instructions/Prompt: ${prompt}\n` : ''}
${existingRoomsContext ? `Existing Rooms Context:\n${existingRoomsContext}\n` : ''}
${otaContext ? `OTA Synced Context:\n${otaContext}\n` : ''}
${attachedImagesContext ? `New Attached Images Context:\n${attachedImagesContext}\n` : ''}
${contextText ? `Webpage raw text context:\n${contextText}\n` : ''}
`;

        if (!userInput.trim() && (!Array.isArray(history) || history.length === 0)) {
            return res.status(400).json({ success: false, message: "Please provide either a prompt, a valid hotel URL, or query." });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Define Structured Schema for Gemini JSON Output (Conversational + Rooms list)
        const copilotSchema = {
            type: "object",
            properties: {
                reply: {
                    type: "string",
                    description: "A friendly, helpful, conversational response to the user's message. Explain what was found, greet them, answer their questions, or guide them on what info is needed."
                },
                rooms: {
                    type: "array",
                    description: "List of room categories extracted or modified. This MUST be empty [] if the user is just chatting and no rooms are being configured.",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number", description: "Database ID of the room category if it is an existing room being edited. Omit or set to null/0 for new room categories." },
                            name: { type: "string", description: "Name of the room category. CRITICAL: Match the exact name of the room category as it appears in the scraped OTA context (e.g., 'Standard Double or Twin Room'). Do not change, standardise, or genericise it." },
                            description: { type: "string", description: "A detailed, premium, and compelling description of the room (2 to 4 sentences, 40 to 60 words). Highlight the overall comfort, layout, type of view (e.g., city, garden), key amenities, and appeal to guests. Do not write brief or single-phrase summaries." },
                            pricePerNight: { type: "number", description: "Estimated price per night in INR" },
                            maxOccupancy: { type: "number", description: "Maximum number of total guests allowed in the room" },
                            bedConfiguration: { type: "string", description: "Bed configuration (e.g. 1 king bed, 2 twin beds)" },
                            sizeM2: { type: "number", description: "Room size in square meters" },
                            amenities: {
                                type: "array",
                                items: { type: "string" },
                                description: "Comprehensive list of detailed amenities in this room category. You MUST extract and include ALL available amenities found in the context (no matter how many, e.g. 20 to 45 amenities per room category). Do not genericise, truncate, or omit any amenities."
                            },
                            images: {
                                type: "array",
                                items: { type: "string" },
                                description: "List of image URLs/paths associated with this room category, including any from the 'New Attached Images Context' if appropriate."
                            },
                            totalInventory: { type: "number", description: "Default total inventory count for this room category" },
                            variants: {
                                type: "array",
                                description: "Applicable meal plan variants (standard is Room Only/EP, Breakfast Included/CP)",
                                items: {
                                    type: "object",
                                    properties: {
                                        mealPlan: { type: "string", description: "Meal plan type (e.g. Room Only, Breakfast Included)" },
                                        price: { type: "number", description: "Price for this specific variant in INR" },
                                        policy: { type: "string", description: "Cancellation policy description" }
                                    },
                                    required: ["mealPlan", "price", "policy"]
                                }
                            }
                        },
                        required: ["name", "pricePerNight", "maxOccupancy", "amenities"]
                    }
                },
                clearAllRooms: {
                    type: "boolean",
                    description: "Set this to true ONLY if the user explicitly requested to delete, clear, remove, or drop all room categories of the hotel."
                }
            },
            required: ["reply", "rooms"]
        };

        const systemInstruction = `
You are a friendly, conversational AI Room Copilot helping administrators onboard and manage hotel properties.
Respond like a warm, helpful peer or expert hotel consultant—friendly, conversational, and highly interactive.

DISCUSSION & CONVERSATION RULES:
1. Do NOT repeat the same generic boilerplate or robotic support messages. If the user greets you or discusses general details, actively converse with them!
2. Answer questions about your capabilities (e.g., "Aap bottom bar par Paperclip icon click karke images attach kar sakte hain, ya suggestions aane ke baad card par directly add kar sakte hain. Main unhe high-res WebP mein convert kar dunga!").
3. Suggest optimal layouts, suggest bed types, recommend room names, and estimate rates per night based on the hotel's city/class.
4. Offer choices, suggestions, and ask guiding questions (e.g., "Kya aap deluxe room ke sath a premium suite add karna chahenge?").
5. Explain your reasoning in the conversational reply (e.g., "I suggested a Suite because your property is a resort...").

LANGUAGE RULES:
1. **Conversational Reply (the "reply" field)**:
   - **CRITICAL**: Detect the language and writing script (Latin, Devanagari, etc.) used by the user in their prompt or conversation history, and reply in the **EXACT SAME language, script, and tone** (whether English, Hinglish, Hindi, Spanish, or any other global language).
   - If the user uses English, reply in English.
   - If the user uses Hinglish (e.g., "room setup kar de"), reply in Hinglish.
   - If the user uses Hindi script (e.g., "कमरे जोड़ें"), reply in Hindi script.
   - If the user uses Spanish, reply in Spanish.
   - Adapt dynamically to whatever language they choose.
2. **Room Details (inside the "rooms" array)**:
   - **CRITICAL**: Every single field inside the "rooms" array (such as room name, description, bedConfiguration, variants meal plan names, cancellation policies, and parsed amenities) MUST ALWAYS be generated in **STRICTLY English**.
   - Absolutely NO Devanagari characters, and NO Hinglish allowed inside the "rooms" array fields. For example, write "Suite" instead of "सूट", "1 King Bed" instead of "1 किंग साइज़ बेड", and "Air conditioning" instead of "एयर कंडीशनर".

Your tasks:
1. If the user is just greeting you, asking general questions, or discussing details which DO NOT require showing or listing rooms, respond conversationally in the "reply" field. Keep "rooms" as an empty array [].
2. If the user asks to see, show, list, view, or display the rooms (e.g. "rooms dikhao", "rooms show karo", "show rooms"):
   - Populate the "rooms" array with all the existing rooms configured in the database (preserving their database "id" fields exactly).
   - Write a friendly reply in the "reply" field listing the rooms and inviting them to review or edit them.
3. If the user asks about room pricing:
   - Always check the "activeDailyRateOverrides" property of the rooms. If there are active overrides for specific dates (e.g. ₹2), emphasize these promo rates in your conversational reply instead of only quoting the base price (e.g., ₹7500)! Tell the user that the rates have been overridden dynamically for those dates.
4. If the user provides hotel details, description text, or a URL context and asks to extract, draft, or list room categories:
   - Analyze the text and extract all listed room categories.
   - For each room category, populate the "rooms" array following the schema rules in strictly English.
   - Summarize what you found in a friendly, conversational manner in the "reply" field.
5. If the user asks to edit, update, modify, or delete rooms from the list of existing rooms (provided in the "Existing Rooms Context"):
   - Read the existing rooms list and apply the requested changes.
   - Output the resulting full list of rooms (both unmodified rooms and modified rooms) in the "rooms" array.
   - **CRITICAL**: For any room that already exists in the "Existing Rooms Context", you MUST preserve its database "id" field exactly in the output. This allows the backend to update the existing record instead of creating a duplicate.
   - For new room categories, do not include an "id" or set it to null.
   - Explain what edits were performed in the "reply" field.
6. If the user asks you to look up, search, or research a hotel (e.g., "search Google for Hotel Gold Souk rooms"), or if you need to find fresh details/listings for the property on the internet, utilize your Google Search tool to find relevant travel listing web pages (e.g., Booking.com, Agoda, MakeMyTrip). Process the search results to extract, update, or structure the rooms.
7. If the user explicitly asks you to delete, clear, or remove all rooms/categories of the hotel, set the "clearAllRooms" boolean property to true, set "rooms" as an empty array [], and explain the deletion in the "reply" field.
8. **NEW IMAGES ATTACHMENT**: If the user has uploaded new images (provided in the "New Attached Images Context"), you should suggest attaching these images to the appropriate room categories by listing their exact relative paths inside the "images" array for those room categories. Tell the user in your reply to verify these images and decide which one should be Primary vs Gallery in the interactive UI.

For each room category:
- **CRITICAL NAME MATCHING**: The room names ("name" field) MUST match the exact names of the room categories as parsed from the OTA link context (e.g., if the link context says "Standard Double or Twin Room", use exactly "Standard Double or Twin Room", do not change, shorten, or genericise it).
- **CRITICAL AMENITIES EXTRACTION**: Compile a comprehensive list of amenities. You MUST extract and list ALL available amenities found in the context (no matter how many, e.g. 20 to 45 amenities per room category). Do not genericise, truncate, or omit any amenities.
- Write a detailed, compelling, and professional description of the room (2 to 4 sentences, 40 to 60 words). Highlight the overall comfort, decor, layout, view, and premium appeal.
- Estimate or extract its base price per night in INR. If a price is found in a foreign currency, convert it to INR (roughly ₹85 to $1 USD).
- Compile a clean list of amenities. Standardize amenity names (e.g. use "Air conditioning", "Free Wi-Fi", "Minibar", "Electric kettle", "Flat-screen TV").
- Formulate typical variants. For example:
  - "Room Only" or "Room Only (EP)" (using base price)
  - "Breakfast Included" or "Breakfast Included (CP)" (typically ₹300-₹500 more per guest)
  Ensure variants have an incrementing integer ID starting from 1 in the final output.
- If details are missing, estimate standard reasonable values (e.g., standard Standard Double room size is 18m2, max occupancy is 2, standard inventory is 5).

Output strictly valid JSON matching the requested schema. Do not include any markdown fences (like \`\`\`json) outside the structural JSON formatting.
`;

        const groqApiKey = process.env.GROQ_API_KEY;

        const needsSearch = !url && (!urls || urls.length === 0) && (prompt && (
            prompt.toLowerCase().includes("search") ||
            prompt.toLowerCase().includes("google") ||
            prompt.toLowerCase().includes("find") ||
            prompt.toLowerCase().includes("look up") ||
            prompt.toLowerCase().includes("research") ||
            prompt.toLowerCase().includes("internet")
        ));

        let jsonText = "";
        let searchQueries = [];
        let searchSources = [];

        if (apiKey) {
            if (needsSearch) {
                // ==========================================
                // PASS 1: Search Grounding & Chat Context (Text Mode via Gemini)
                // ==========================================
                console.log("[AI Copilot] Pass 1: Calling Gemini with Google Search grounding...");
                let searchContents = [];
                if (Array.isArray(history) && history.length > 0) {
                    history.forEach(msg => {
                        searchContents.push({
                            role: msg.role === "model" ? "model" : "user",
                            parts: [{ text: msg.text }]
                        });
                    });
                }
                searchContents.push({
                    role: "user",
                    parts: [{ text: userInput.trim() ? userInput : (prompt || "Continue chatting") }]
                });

                const searchResponse = await runGeminiWithFallback(
                    genAI,
                    {
                        model: "gemini-2.5-flash",
                        systemInstruction,
                        tools: [{ googleSearch: {} }],
                    },
                    (model) => model.generateContent({ contents: searchContents })
                );
                const groundedText = searchResponse.response.text();

                console.log(`[AI Copilot] Pass 1 completed. Grounded Text Length: ${groundedText.length}`);

                try {
                    const candidate = searchResponse.response?.candidates?.[0];
                    if (candidate && candidate.groundingMetadata) {
                        const metadata = candidate.groundingMetadata;
                        if (Array.isArray(metadata.webSearchQueries)) {
                            searchQueries = metadata.webSearchQueries;
                        }
                        if (Array.isArray(metadata.groundingChunks)) {
                            searchSources = metadata.groundingChunks
                                .map(chunk => {
                                    if (chunk.web) {
                                        return {
                                            title: chunk.web.title || "",
                                            url: chunk.web.uri || ""
                                        };
                                    }
                                    return null;
                                })
                                .filter(Boolean);
                        }
                    }
                } catch (metadataError) {
                    console.error("[AI Copilot] Error parsing grounding metadata:", metadataError);
                }

                // ==========================================
                // PASS 2: JSON Schema Structure (JSON Mode via Gemini)
                // ==========================================
                console.log("[AI Copilot] Pass 2: Structuring output to JSON via Gemini...");
                const structPrompt = `
Grounded Context (contains search findings or conversational replies):
${groundedText}

User Instructions/Prompt:
${prompt || ""}

Existing Rooms Context:
${existingRoomsContext || "None"}
`;

                const result = await runGeminiWithFallback(
                    genAI,
                    {
                        model: "gemini-2.5-flash",
                        systemInstruction,
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: copilotSchema,
                            temperature: 0.6
                        }
                    },
                    (model) => model.generateContent(structPrompt)
                );
                jsonText = result.response.text();
                console.log("[AI Copilot] Pass 2 completed (Gemini). JSON structured output received.");

            } else {
                // ==========================================
                // Single-Pass JSON Generation via Gemini (gemini-2.5-flash)
                // ==========================================
                console.log("[AI Copilot] Calling Gemini (gemini-2.5-flash) for single-pass structured JSON generation...");
                let contents = [];
                if (Array.isArray(history) && history.length > 0) {
                    history.forEach(msg => {
                        contents.push({
                            role: msg.role === "model" ? "model" : "user",
                            parts: [{ text: msg.text }]
                        });
                    });
                }
                contents.push({
                    role: "user",
                    parts: [{ text: userInput.trim() ? userInput : (prompt || "Continue chatting") }]
                });

                const result = await runGeminiWithFallback(
                    genAI,
                    {
                        model: "gemini-2.5-flash",
                        systemInstruction,
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: copilotSchema,
                            temperature: 0.6
                        }
                    },
                    (model) => model.generateContent({ contents })
                );
                jsonText = result.response.text();
                console.log("[AI Copilot] Gemini single-pass completed. JSON structured output received.");
            }

        } else if (groqApiKey) {
            // ==========================================
            // Single-Pass JSON Generation via Groq
            // ==========================================
            console.log("[AI Copilot] Calling Groq for single-pass JSON generation...");
            
            let groqMessages = [
                { role: "system", content: systemInstruction + `\n\nJSON SCHEMA TO FOLLOW:\n${JSON.stringify(copilotSchema, null, 2)}\n\nCRITICAL: You MUST output strictly a valid JSON object matching this schema structure. Do not output markdown code blocks (like \`\`\`json ... \`\`\`).` }
            ];
            
            if (Array.isArray(history) && history.length > 0) {
                history.forEach(msg => {
                    groqMessages.push({
                        role: msg.role === "model" || msg.role === "assistant" ? "assistant" : "user",
                        content: msg.text
                    });
                });
            }
            
            groqMessages.push({
                role: "user",
                content: userInput.trim() ? userInput : (prompt || "Continue chatting")
            });

            const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: groqMessages,
                    response_format: { type: "json_object" },
                    temperature: 0.6
                })
            });

            if (!groqResponse.ok) {
                const errText = await groqResponse.text();
                throw new Error(`Groq API Error: ${groqResponse.status} - ${errText}`);
            }

            const groqData = await groqResponse.json();
            jsonText = groqData.choices[0].message.content;
            console.log("[AI Copilot] Groq call completed. JSON structured output received.");

        } else {
            throw new Error("No available AI service found. Please check your GEMINI_API_KEY or GROQ_API_KEY in .env");
        }

        let parsed = { reply: "", rooms: [] };
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            console.error("AI Model failed to return valid JSON parser:", e.message);
            return res.status(500).json({
                success: false,
                message: "AI Model did not return valid structured data. Please try again with different inputs.",
                rawResponse: jsonText
            });
        }

        const rawRooms = Array.isArray(parsed.rooms) ? parsed.rooms : [];

        const { findBestRoomMatch } = require('./adminController');

        // Post-process to ensure variants have incremental IDs
        let processedRooms = rawRooms.map(room => {
            const baseInventory = parseInt(room.totalInventory) || 5;
            const size = parseInt(room.sizeM2) || 18;
            
            const rawVariants = Array.isArray(room.variants) ? room.variants : [];
            const processedVariants = rawVariants.map((v, index) => ({
                id: index + 1,
                mealPlan: v.mealPlan || "Room Only",
                price: parseFloat(v.price) || room.pricePerNight,
                policy: v.policy || "Free cancellation till 24h"
            }));

            // Fallback default EP variant if none extracted
            if (processedVariants.length === 0) {
                processedVariants.push({
                    id: 1,
                    mealPlan: "Room Only (EP)",
                    price: room.pricePerNight,
                    policy: "Free cancellation till 24h"
                });
            }

            return {
                id: room.id || undefined,
                ...room,
                totalInventory: baseInventory,
                sizeM2: size,
                variants: processedVariants
            };
        });

        // Failsafe: If OTA url was provided and we successfully scraped exact room categories,
        // restore exact names, merge amenities (ensuring at least 10), and restore live pricing variants!
        if (scrapedData && Array.isArray(scrapedData.rooms) && scrapedData.rooms.length > 0) {
            console.log(`[AI Copilot Failsafe] Applying post-processing restoration on raw generated rooms against ${scrapedData.rooms.length} scraped rooms.`);
            processedRooms = processedRooms.map(room => {
                const matchedScraped = findBestRoomMatch(room.name, scrapedData.rooms, (r) => r.name);
                if (matchedScraped) {
                    console.log(`[AI Copilot Failsafe] Restoring details for room: "${room.name}" -> "${matchedScraped.name}"`);
                    
                    // 1. Merge amenities
                    const scrapedAmenities = Array.isArray(matchedScraped.amenities) ? matchedScraped.amenities : [];
                    const aiAmenities = Array.isArray(room.amenities) ? room.amenities : [];
                    const mergedAmenities = Array.from(new Set([...aiAmenities, ...scrapedAmenities])).filter(Boolean);
                    
                    const standardAmenities = [
                        "Air conditioning", "Free Wi-Fi", "Flat-screen TV", "Private bathroom", 
                        "Free toiletries", "Shower", "Towels", "Desk", "Electric kettle", "Safe"
                    ];
                    let finalAmenities = mergedAmenities;
                    if (finalAmenities.length < 10) {
                        for (const std of standardAmenities) {
                            if (!finalAmenities.includes(std)) {
                                finalAmenities.push(std);
                            }
                            if (finalAmenities.length >= 10) break;
                        }
                    }

                    // 2. Restore live pricing variants (EP, CP, MAP, AP)
                    const scrapedVariants = Array.isArray(matchedScraped.variants) ? matchedScraped.variants : [];
                    const aiVariants = Array.isArray(room.variants) ? room.variants : [];
                    let finalVariants = scrapedVariants.length > 0 ? scrapedVariants : aiVariants;
                    
                    const processedVariants = finalVariants.map((v, index) => ({
                        id: index + 1,
                        mealPlan: v.mealPlan || "Room Only",
                        price: parseFloat(v.price) || room.pricePerNight,
                        policy: v.policy || "Free cancellation till 24h"
                    }));

                    if (processedVariants.length === 0) {
                        processedVariants.push({
                            id: 1,
                            mealPlan: "Room Only (EP)",
                            price: room.pricePerNight,
                            policy: "Free cancellation till 24h"
                        });
                    }

                    // 3. Restore/Merge images automatically if database room has no images
                    const scrapedImages = Array.isArray(matchedScraped.images) ? matchedScraped.images : [];
                    const aiImages = Array.isArray(room.images) ? room.images : [];
                    
                    let dbHasNoImages = false;
                    let existingRoomId = room.id || undefined;
                    
                    if (existingRoomId && Array.isArray(existingRooms)) {
                        const extRoom = existingRooms.find(er => er.id === existingRoomId);
                        if (extRoom) {
                            const dbImages = Array.isArray(extRoom.images) 
                                ? extRoom.images 
                                : (typeof extRoom.images === 'string' ? JSON.parse(extRoom.images || "[]") : []);
                            if (dbImages.length === 0) {
                                dbHasNoImages = true;
                            }
                        }
                    } else if (!existingRoomId) {
                        // Match existing room by name similarity if ID was not preserved by the AI model
                        if (Array.isArray(existingRooms)) {
                            const extRoom = existingRooms.find(er => er.name && er.name.toLowerCase().trim() === room.name.toLowerCase().trim());
                            if (extRoom) {
                                existingRoomId = extRoom.id;
                                const dbImages = Array.isArray(extRoom.images) 
                                    ? extRoom.images 
                                    : (typeof extRoom.images === 'string' ? JSON.parse(extRoom.images || "[]") : []);
                                if (dbImages.length === 0) {
                                    dbHasNoImages = true;
                                }
                            } else {
                                dbHasNoImages = true;
                            }
                        } else {
                            dbHasNoImages = true;
                        }
                    }

                    let finalImages = aiImages;
                    if (dbHasNoImages || aiImages.length === 0) {
                        // Merge scraped images with any AI/attached images
                        finalImages = Array.from(new Set([...aiImages, ...scrapedImages])).filter(Boolean);
                    }

                    return {
                        ...room,
                        id: existingRoomId,
                        name: matchedScraped.name, // Exact name matching from link
                        amenities: finalAmenities, // Rich amenities (minimum 10)
                        variants: processedVariants, // Live rate plans (EP, CP, MAP, AP)
                        images: finalImages, // Restored/Merged images
                        pricePerNight: matchedScraped.price || room.pricePerNight,
                        maxOccupancy: matchedScraped.maxOccupancy || room.maxOccupancy,
                        bedConfiguration: matchedScraped.bedConfiguration || room.bedConfiguration,
                        description: (room.description && room.description.length > 25) ? room.description : (matchedScraped.description || room.description || `Premium ${matchedScraped.name} room category offering comfort and luxury amenities.`),
                        sizeM2: matchedScraped.sizeM2 || room.sizeM2
                    };
                }
                return room;
            });
        }

        res.status(200).json({
            success: true,
            reply: parsed.reply || "Rooms list parsed successfully.",
            count: processedRooms.length,
            data: processedRooms,
            clearAllRooms: parsed.clearAllRooms || false,
            searchQueries,
            searchSources
        });

    } catch (err) {
        console.error("AI_SUGGEST_ROOMS_ERROR:", err);
        let userMessage = "AI extraction failed";
        if (err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("limit"))) {
            userMessage = "Gemini API quota exceeded. The free tier limits requests to 20 per minute. Please wait a few seconds and try again!";
        }
        res.status(500).json({ success: false, message: userMessage, error: err.message });
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
 * @desc    Scrape hotel reviews from external OTA page and insert into database
 * @route   POST /api/admin/ai/import-reviews
 * @access  Private (Super Admin)
 */
exports.importReviews = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: "Gemini API Key is not configured. Please add GEMINI_API_KEY to your backend .env file."
            });
        }

        const { hotelId, url } = req.body;

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "hotelId is required" });
        }
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            return res.status(400).json({ success: false, message: "A valid hotel OTA URL is required" });
        }

        // Verify hotel exists
        const targetHotel = await prisma.hotel.findUnique({
            where: { id: Number(hotelId) }
        });
        if (!targetHotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        // 1. Crawl/Fetch text content from OTA Reviews URL
        const getBookingComReviewsUrl = (targetUrl) => {
            let cleanUrl = targetUrl.trim();
            const match = cleanUrl.match(/booking\.com\/hotel\/([a-z]+)\/([^?#\s]+)/i);
            if (match) {
                const country = match[1];
                const slug = match[2];
                return `https://www-booking-com.translate.goog/reviews/${country}/hotel/${slug}?_x_tr_sl=auto&_x_tr_tl=en`;
            }
            if (cleanUrl.includes('booking.com')) {
                return cleanUrl.replace('booking.com', 'www-booking-com.translate.goog') + (cleanUrl.includes('?') ? '&' : '?') + '_x_tr_sl=auto&_x_tr_tl=en';
            }
            return cleanUrl;
        };

        const reviewsUrl = getBookingComReviewsUrl(url);
        console.log(`[Import Reviews] Fetching reviews URL: ${reviewsUrl}`);

        let html = "";
        try {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            const response = await fetch(reviewsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
                },
                signal: AbortSignal.timeout(20000)
            });
            if (response.ok) {
                html = await response.text();
            } else {
                throw new Error(`Proxy returned status ${response.status}`);
            }
        } catch (fetchErr) {
            console.warn(`[Import Reviews] Proxy fetch failed (${fetchErr.message}), trying raw URL direct fetch...`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
                },
                signal: AbortSignal.timeout(15000)
            });
            html = await response.text();
        }

        // Clean HTML to extract readable text
        const cleanedText = cleanHtmlText(html);
        if (!cleanedText || cleanedText.length < 100) {
            return res.status(400).json({
                success: false,
                message: "Failed to extract readable reviews text content from the provided URL page."
            });
        }

        // 2. Setup Gemini AI to parse the reviews into standard structured JSON
        const genAI = new GoogleGenerativeAI(apiKey);
        const reviewsSchema = {
            type: "object",
            properties: {
                reviews: {
                    type: "array",
                    description: "List of extracted reviews from the webpage content text.",
                    items: {
                        type: "object",
                        properties: {
                            userName: { type: "string", description: "Full name or screen name of the reviewer. Generate realistic first/last initial names if anonymous or missing." },
                            rating: { type: "number", description: "Overall rating given out of 5 stars. If the source shows rating out of 10 (e.g. 8.4/10), scale it down to 1-5 integer (e.g., 8.4/10 -> 4)." },
                            comment: { type: "string", description: "Review comment content in natural English." },
                            cleanliness: { type: "number", description: "Cleanliness rating score from 1 to 5 (default 5)." },
                            comfort: { type: "number", description: "Comfort rating score from 1 to 5 (default 5)." },
                            location: { type: "number", description: "Location rating score from 1 to 5 (default 5)." },
                            staff: { type: "number", description: "Staff / Service behavior rating score from 1 to 5 (default 5)." },
                            valueForMoney: { type: "number", description: "Value for money rating score from 1 to 5 (default 5)." },
                            createdAt: { type: "string", description: "Review date in YYYY-MM-DD format (default is recent dates)." }
                        },
                        required: ["userName", "rating", "comment"]
                    }
                }
            },
            required: ["reviews"]
        };

        const systemInstruction = `
You are an expert data extraction assistant. Your job is to extract customer review logs from the raw text content of a hotel webpage listing.
Extract all customer reviews present in the webpage text (up to 30 reviews). Parse out reviewer name, ratings, individual subscore ratings (Cleanliness, Comfort, Location, Staff, Value For Money), comment/text, and date.
Return the output strictly in valid JSON format matching the schema rules.
`;

        const structPrompt = `
Webpage content text:
${cleanedText.slice(0, 40000)}

Please extract the reviews. Ensure they are structured as JSON.
`;

        console.log("[Import Reviews] Calling Gemini 2.5 flash parser...");
        const result = await runGeminiWithFallback(
            genAI,
            {
                model: "gemini-2.5-flash",
                systemInstruction,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: reviewsSchema,
                    temperature: 0.2
                }
            },
            (model) => model.generateContent(structPrompt)
        );
        const jsonText = result.response.text();
        
        let parsed = { reviews: [] };
        try {
            parsed = JSON.parse(jsonText);
        } catch (jsonErr) {
            console.error("Gemini failed to generate valid JSON:", jsonText);
            throw new Error("AI did not return valid JSON structured reviews.");
        }

        const extractedReviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
        console.log(`[Import Reviews] Extracted ${extractedReviews.length} reviews from Gemini response.`);

        if (extractedReviews.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No reviews were found on the page to import.",
                data: []
            });
        }

        // 3. Store reviews in local Database
        const bcrypt = require('bcryptjs');
        const savedReviews = [];

        for (const rev of extractedReviews) {
            // Generate unique email address to avoid duplicate users unique constraints
            const cleanName = rev.userName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'guest';
            const dummyEmail = `reviewer_${cleanName}_${Math.floor(Math.random() * 100000)}@gethotelstays.mock`;
            
            // Create virtual user account
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

            const dummyUser = await prisma.user.create({
                data: {
                    name: rev.userName,
                    email: dummyEmail,
                    password: hashedPassword,
                    role: 'user',
                    updatedAt: new Date()
                }
            });

            // Create review associated with the user and hotel
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

        // 4. Recalculate average guestRating and total reviewCount for target hotel
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

        console.log(`[Import Reviews] Successfully saved ${savedReviews.length} reviews. Avg rating updated to ${avgRating}`);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${savedReviews.length} reviews for this hotel!`,
            count: savedReviews.length,
            data: savedReviews
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
 * @desc    Preview/Parse bulk hotel uploads via Gemini AI (does not write to DB)
 * @route   POST /api/admin/ai/bulk-onboard-preview
 * @access  Private (Super Admin)
 */
exports.bulkOnboardPreview = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: "Gemini API Key is not configured. Please add GEMINI_API_KEY to your backend .env file."
            });
        }

        const { files } = req.body;
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a non-empty array of files." });
        }

        if (files.length > 10) {
            return res.status(400).json({ success: false, message: "Maximum of 10 files are allowed per bulk onboarding." });
        }

        const normalizedHotels = [];
        const genAI = new GoogleGenerativeAI(apiKey);

        // Gemini Schema configuration
        const onboardingSchema = {
            type: "object",
            properties: {
                hotel: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        tagline: { type: "string" },
                        description: { type: "string" },
                        city: { type: "string" },
                        address: { type: "string" },
                        pricePerNight: { type: "number" },
                        starRating: { type: "number" },
                        amenities: { type: "array", items: { type: "string" } },
                        mainAmenities: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "city", "address", "description"]
                },
                partner: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                        password: { type: "string" },
                        phone: { type: "string" }
                    }
                },
                rooms: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            pricePerNight: { type: "number" },
                            maxOccupancy: { type: "number" },
                            bedConfiguration: { type: "string" },
                            sizeM2: { type: "number" },
                            totalInventory: { type: "number" },
                            amenities: { type: "array", items: { type: "string" } },
                            description: { type: "string" }
                        },
                        required: ["name", "pricePerNight"]
                    }
                }
            },
            required: ["hotel", "partner", "rooms"]
        };

        const systemInstruction = `
You are an expert data migration AI assistant. Your job is to read arbitrary content representing a hotel registration profile and its room categories, and extract/normalize it into a strict JSON matching the schema rules.

RULES:
- Clean up values (trim whitespaces, convert foreign currency to INR roughly ₹85 per USD).
- Do NOT generate markdown code blocks or formatting. Output only valid JSON matching the schema.
- For partner name, email, password, phone, extract them if available in the text.
`;

        // 1. Run all Gemini AI normalizations in parallel
        console.log(`[AI Onboard Preview] Normalizing ${files.length} files...`);
        const normalizationPromises = files.map(async (fileObj) => {
            const fileName = fileObj.fileName || "unnamed.json";
            const content = fileObj.content || "";
            try {
                console.log(`[AI Onboard Preview] [Gemini Start] Normalizing file: ${fileName}...`);
                const geminiResult = await runGeminiWithFallback(
                    genAI,
                    {
                        model: "gemini-2.5-flash",
                        systemInstruction,
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: onboardingSchema,
                            temperature: 0.1
                        }
                    },
                    (model) => model.generateContent(`File content:\n${content}`)
                );

                const normalizedText = geminiResult.response.text();
                const parsed = JSON.parse(normalizedText);
                return { fileName, success: true, parsed };
            } catch (err) {
                console.error(`[AI Onboard Preview] [Gemini Error] File ${fileName}:`, err);
                return { fileName, success: false, error: err.message || "Gemini parsing failed." };
            }
        });

        const normalizedFiles = await Promise.all(normalizationPromises);
        console.log(`[AI Onboard Preview] Parallel normalization completed. Processing duplicate checks...`);

        // 2. Perform duplicate checks and credentials generation for preview
        for (const normFile of normalizedFiles) {
            const { fileName } = normFile;

            if (!normFile.success) {
                normalizedHotels.push({
                    fileName,
                    success: false,
                    skipped: false,
                    message: normFile.error
                });
                continue;
            }

            try {
                const { hotel, partner, rooms } = normFile.parsed;

                if (!hotel || !hotel.name || !hotel.city || !hotel.address) {
                    throw new Error("Normalized hotel profile lacks required fields (name, city, address).");
                }

                const hName = hotel.name.trim();
                const hCity = hotel.city.trim();
                const hAddress = hotel.address.trim();

                // Generate credentials if missing
                let pEmail = partner?.email ? partner.email.toLowerCase().trim() : '';
                if (!pEmail) {
                    const cleanHotelSlug = hName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    pEmail = `sample@${cleanHotelSlug}.com`;
                }

                let pPassword = partner?.password ? String(partner.password).trim() : '';
                let generatedPasswordMsg = '';
                if (!pPassword) {
                    pPassword = `${hName.replace(/[^a-zA-Z0-9]/g, '')}#2026`;
                    generatedPasswordMsg = ' (Auto-generated password)';
                }

                const pPhone = partner?.phone ? String(partner.phone).trim() : '';

                // Duplicate Check
                const existingUser = await prisma.user.findUnique({
                    where: { email: pEmail }
                });

                const existingHotel = await prisma.hotel.findFirst({
                    where: {
                        name: hName,
                        city: hCity
                    }
                });

                let skipped = false;
                let message = "Ready to onboard.";
                if (existingUser || existingHotel) {
                    skipped = true;
                    if (existingUser && existingHotel) {
                        message = `Duplicate Warning: Partner email "${pEmail}" AND hotel "${hName}" in "${hCity}" already exist.`;
                    } else if (existingUser) {
                        message = `Duplicate Warning: Partner email "${pEmail}" already exists.`;
                    } else {
                        message = `Duplicate Warning: Hotel "${hName}" in "${hCity}" already exists.`;
                    }
                }

                normalizedHotels.push({
                    fileName,
                    success: true,
                    skipped,
                    hotelName: hName,
                    hotel: {
                        ...hotel,
                        name: hName,
                        city: hCity,
                        address: hAddress
                    },
                    partner: {
                        name: partner?.name || hName,
                        email: pEmail,
                        password: pPassword,
                        phone: pPhone
                    },
                    rooms: rooms || [],
                    message
                });

            } catch (err) {
                normalizedHotels.push({
                    fileName,
                    success: false,
                    skipped: false,
                    message: err.message || "Failed to normalize parsed hotel."
                });
            }
        }

        res.status(200).json({
            success: true,
            hotels: normalizedHotels
        });

    } catch (err) {
        console.error("AI_BULK_ONBOARD_PREVIEW_ERROR:", err);
        res.status(500).json({ success: false, message: "Failed to generate bulk onboarding preview", error: err.message });
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

