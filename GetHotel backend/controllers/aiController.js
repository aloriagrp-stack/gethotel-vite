const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const sharp = require('sharp');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

        // Prepare existing rooms context
        let existingRoomsContext = "";
        if (Array.isArray(existingRooms) && existingRooms.length > 0) {
            const simplifiedRooms = existingRooms.map(r => ({
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
                variants: typeof r.variants === 'string' ? JSON.parse(r.variants || "[]") : (Array.isArray(r.variants) ? r.variants : [])
            }));
            existingRoomsContext = `The hotel currently has the following existing rooms configured in the database:\n${JSON.stringify(simplifiedRooms, null, 2)}\n`;
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
   - By default, speak and reply in **English**.
   - If the user explicitly asks you to speak in Hinglish (e.g., "Hinglish me baat kar" or similar), or if you are replying to Hinglish messages (e.g., "images add kar sakta hai /"), you MUST reply in natural, friendly **Hinglish** using Latin script (e.g., "Haan bilkul! Aap screen ke niche paperclip button se images attach kar sakte hain. Aap suggestions cards par directly dynamically bhi images upload kar sakte hain...").
   - **CRITICAL**: Never write any conversational reply using Devanagari/Hindi script (e.g., avoid "सूट" or "मैं आपका सहायक हूँ" in the reply). Use only Latin characters (English/Hinglish text).
2. **Room Details (inside the "rooms" array)**:
   - **CRITICAL**: Every single field inside the "rooms" array (such as room name, description, bedConfiguration, variants meal plan names, cancellation policies, and parsed amenities) MUST ALWAYS be generated in **STRICTLY English**.
   - Absolutely NO Devanagari characters, and NO Hinglish allowed inside the "rooms" array fields. For example, write "Suite" instead of "सूट", "1 King Bed" instead of "1 किंग साइज़ बेड", and "Air conditioning" instead of "एयर कंडीशनर".

Your tasks:
1. If the user is just greeting you, asking questions, or discussing general details, respond conversationally in the "reply" field in a friendly, personalized manner. Keep "rooms" as an empty array [].
2. If the user provides hotel details, description text, or a URL context and asks to extract, draft, or list room categories:
   - Analyze the text and extract all listed room categories.
   - For each room category, populate the "rooms" array following the schema rules in strictly English.
   - Summarize what you found in a friendly, conversational manner in the "reply" field.
3. If the user asks to edit, update, modify, or delete rooms from the list of existing rooms (provided in the "Existing Rooms Context"):
   - Read the existing rooms list and apply the requested changes.
   - Output the resulting full list of rooms (both unmodified rooms and modified rooms) in the "rooms" array.
   - **CRITICAL**: For any room that already exists in the "Existing Rooms Context", you MUST preserve its database "id" field exactly in the output. This allows the backend to update the existing record instead of creating a duplicate.
   - For new room categories, do not include an "id" or set it to null.
   - Explain what edits were performed in the "reply" field.
4. If the user asks you to look up, search, or research a hotel (e.g., "search Google for Hotel Gold Souk rooms"), or if you need to find fresh details/listings for the property on the internet, utilize your Google Search tool to find relevant travel listing web pages (e.g., Booking.com, Agoda, MakeMyTrip). Process the search results to extract, update, or structure the rooms.
5. If the user explicitly asks you to delete, clear, or remove all rooms/categories of the hotel, set the "clearAllRooms" boolean property to true, set "rooms" as an empty array [], and explain the deletion in the "reply" field.
6. **NEW IMAGES ATTACHMENT**: If the user has uploaded new images (provided in the "New Attached Images Context"), you should suggest attaching these images to the appropriate room categories by listing their exact relative paths inside the "images" array for those room categories. Tell the user in your reply to verify these images and decide which one should be Primary vs Gallery in the interactive UI.

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

        if (needsSearch && apiKey) {
            // ==========================================
            // PASS 1: Search Grounding & Chat Context (Text Mode via Gemini)
            // ==========================================
            console.log("[AI Copilot] Pass 1: Calling Gemini with Google Search grounding...");
            const searchModel = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction,
                tools: [{ googleSearch: {} }],
            });

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

            const searchResponse = await searchModel.generateContent({ contents: searchContents });
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
            const structModel = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: copilotSchema,
                    temperature: 0.6
                }
            });

            const structPrompt = `
Grounded Context (contains search findings or conversational replies):
${groundedText}

User Instructions/Prompt:
${prompt || ""}

Existing Rooms Context:
${existingRoomsContext || "None"}
`;

            const result = await structModel.generateContent(structPrompt);
            jsonText = result.response.text();
            console.log("[AI Copilot] Pass 2 completed (Gemini). JSON structured output received.");

        } else if (groqApiKey) {
            // ==========================================
            // Single-Pass JSON Generation via Groq (Llama-3.3-70b)
            // ==========================================
            console.log("[AI Copilot] Calling Groq (llama-3.3-70b-versatile) for single-pass JSON generation...");
            
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
                    model: "llama-3.3-70b-versatile",
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
        console.error('[WebP Converter Error]:', err.message);
        res.status(500).json({
            success: false,
            message: `Failed to convert image to WebP: ${err.message}`
        });
    }
};
