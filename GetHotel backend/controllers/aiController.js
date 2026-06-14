const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');

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

        const { hotelId, prompt, url, history, existingRooms } = req.body;

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "hotelId is required" });
        }

        let contextText = "";

        let otaContext = "";

        // If a URL is provided, try to scrape it via detectOtaDetails
        if (url && String(url).startsWith('http')) {
            try {
                console.log(`[AI Copilot] Scraping URL via detectOtaDetails: ${url}`);
                const { detectOtaDetails } = require('./adminController');
                
                // Fetch target hotel details to pass as fallback name
                const targetHotel = await prisma.hotel.findUnique({
                    where: { id: Number(hotelId) }
                });
                const hotelName = targetHotel ? targetHotel.name : "Target Hotel";
                const basePrice = targetHotel ? targetHotel.pricePerNight : 2500;
                
                const scrapedData = await detectOtaDetails(url, hotelName, basePrice);
                if (scrapedData) {
                    otaContext = `We scraped the following high-fidelity hotel details and room configurations from the OTA URL (${url}):\n${JSON.stringify(scrapedData, null, 2)}\n`;
                    console.log(`[AI Copilot] Synced OTA data context successfully parsed.`);
                }
            } catch (err) {
                console.error(`[AI Copilot] Failed to scrape URL via detectOtaDetails: ${err.message}`);
                
                // Fallback to generic simple HTTP fetch if detectOtaDetails fails or is not available
                try {
                    console.log(`[AI Copilot] Scraper fallback: Fetching URL directly...`);
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        },
                        signal: AbortSignal.timeout(10000) // 10s timeout
                    });
                    if (response.ok) {
                        const html = await response.text();
                        contextText = cleanHtmlText(html).slice(0, 50000); // Limit context size
                    }
                } catch (fallbackErr) {
                    console.error(`[AI Copilot] Scraper fallback also failed: ${fallbackErr.message}`);
                }
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
                variants: typeof r.variants === 'string' ? JSON.parse(r.variants || "[]") : (Array.isArray(r.variants) ? r.variants : [])
            }));
            existingRoomsContext = `The hotel currently has the following existing rooms configured in the database:\n${JSON.stringify(simplifiedRooms, null, 2)}\n`;
        }

        // Combine inputs
        const userInput = `
${prompt ? `Instructions/Prompt: ${prompt}\n` : ''}
${existingRoomsContext ? `Existing Rooms Context:\n${existingRoomsContext}\n` : ''}
${otaContext ? `OTA Synced Context:\n${otaContext}\n` : ''}
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
                            description: { type: "string", description: "Brief description of the room and its view/comfort" },
                            pricePerNight: { type: "number", description: "Estimated price per night in INR" },
                            maxOccupancy: { type: "number", description: "Maximum number of total guests allowed in the room" },
                            bedConfiguration: { type: "string", description: "Bed configuration (e.g. 1 king bed, 2 twin beds)" },
                            sizeM2: { type: "number", description: "Room size in square meters" },
                            amenities: {
                                type: "array",
                                items: { type: "string" },
                                description: "Comprehensive list of detailed amenities in this room category. You MUST include at least 10 detailed amenities if available in the context (e.g. Air conditioning, Free Wi-Fi, Flat-screen TV, Coffee maker, Private bathroom, Free toiletries, Shower, Towels, Desk)."
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
Respond like a human friend or helpful peer—warm, conversational, and interactive.

LANGUAGE RULES:
1. **Conversational Reply (the "reply" field)**:
   - By default, speak and reply in **English**.
   - If the user explicitly asks you to speak in Hinglish (e.g., "Hinglish me baat kar" or similar), or if you are replying to Hinglish messages, you can reply in natural, friendly **Hinglish** (using Latin script only, e.g., "Main badhiya hoon, aap batao!", "Main aapke rooms update kar raha hoon").
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

For each room category:
- **CRITICAL NAME MATCHING**: The room names ("name" field) MUST match the exact names of the room categories as parsed from the OTA link context (e.g., if the link context says "Standard Double or Twin Room", use exactly "Standard Double or Twin Room", do not change, shorten, or genericise it).
- **CRITICAL AMENITIES EXTRACTION**: Compile a comprehensive list of amenities. You MUST extract and list at least 10 detailed amenities per room category if they are available in the crawled context (e.g., "Air conditioning", "Free Wi-Fi", "Flat-screen TV", "Minibar", "Electric kettle", "Private bathroom", "Free toiletries", "Shower", "Slippers", "Towels", "Desk", "Safe"). Do not truncate or shorten the list of amenities.
- Identify its name, size (in sq meters), bed config, max occupancy, and total description.
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

        const needsSearch = !url && (prompt && (
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
                    temperature: 0.2
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
                    temperature: 0.2
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

        // Post-process to ensure variants have incremental IDs
        const processedRooms = rawRooms.map(room => {
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
