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

        const { hotelId, prompt, url, history } = req.body;

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "hotelId is required" });
        }

        let contextText = "";

        // If a URL is provided, try to fetch and parse it
        if (url && String(url).startsWith('http')) {
            try {
                console.log(`[AI Copilot] Fetching URL: ${url}`);
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    signal: AbortSignal.timeout(10000) // 10s timeout
                });

                if (response.ok) {
                    const html = await response.text();
                    contextText = cleanHtmlText(html).slice(0, 50000); // Limit context size
                    console.log(`[AI Copilot] Fetched and cleaned ${contextText.length} characters of page text.`);
                } else {
                    console.warn(`[AI Copilot] URL fetch failed with status: ${response.status}`);
                }
            } catch (err) {
                console.error(`[AI Copilot] Failed to fetch URL: ${err.message}`);
            }
        }

        // Combine inputs
        const userInput = `
${prompt ? `Instructions/Prompt: ${prompt}\n` : ''}
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
                    description: "List of room categories extracted from the text. This MUST be empty [] if the user is just chatting or if no rooms are mentioned.",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Name of the room category (e.g. Deluxe Double Room, Superior Suite)" },
                            description: { type: "string", description: "Brief description of the room and its view/comfort" },
                            pricePerNight: { type: "number", description: "Estimated price per night in INR" },
                            maxOccupancy: { type: "number", description: "Maximum number of total guests allowed in the room" },
                            bedConfiguration: { type: "string", description: "Bed configuration (e.g. 1 king bed, 2 twin beds)" },
                            sizeM2: { type: "number", description: "Room size in square meters" },
                            amenities: {
                                type: "array",
                                items: { type: "string" },
                                description: "List of standard amenities in this room category (e.g. Air conditioning, Free Wi-Fi, Flat-screen TV, Coffee maker)"
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
                }
            },
            required: ["reply", "rooms"]
        };

        const systemInstruction = `
You are an expert AI Travel Copilot helping administrators onboard hotel properties to their reservation engine.
You are conversational, friendly, helpful, and interactive.
Your tasks:
1. If the user is just greeting you, asking questions, or discussing general details, respond conversationally in the "reply" field. Keep "rooms" as an empty array [].
2. If the user provides hotel details, description text, or a URL context and asks to extract, draft, or list room categories, analyze the text and extract all listed room categories.
   - For each room category, populate the "rooms" array following the schema rules.
   - Summarize what you found in a friendly manner in the "reply" field.
3. If the user asks to modify a room or make changes based on previous history (e.g. "make standard room price 5000" or "add a balcony amenity to Deluxe"), adjust the rooms based on the history and user request, return the updated rooms in the "rooms" array, and explain the change in the "reply" field.

For each room category:
- Identify its name, size (in sq meters), bed config, max occupancy, and total description.
- Estimate or extract its base price per night in INR. If a price is found in a foreign currency, convert it to INR (roughly ₹85 to $1 USD).
- Compile a clean list of amenities. Standardize amenity names (e.g. use "Air conditioning", "Free Wi-Fi", "Minibar", "Electric kettle", "Flat-screen TV").
- Formulate typical variants. For example:
  - "Room Only" or "Room Only (EP)" (using base price)
  - "Breakfast Included" or "Breakfast Included (CP)" (typically ₹300-₹500 more per guest)
  Ensure variants have an incrementing integer ID starting from 1 in the final output.
- If details are missing, estimate standard reasonable values (e.g. standard Standard Double room size is 18m2, max occupancy is 2, standard inventory is 5).

Output strictly valid JSON matching the requested schema. Do not include any markdown fences (like \`\`\`json) outside the structural JSON formatting.
`;

        // Build Gemini contents with chat history if present
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

        console.log("[AI Copilot] Calling Gemini API with history...");
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: copilotSchema,
                temperature: 0.3
            }
        });

        const result = await model.generateContent({ contents });
        const jsonText = result.response.text();
        console.log("[AI Copilot] Gemini API response received.");

        let parsed = { reply: "", rooms: [] };
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            console.error("Gemini failed to return valid JSON parser:", e.message);
            return res.status(500).json({
                success: false,
                message: "Gemini did not return valid structured data. Please try again with different inputs.",
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
            data: processedRooms
        });

    } catch (err) {
        console.error("AI_SUGGEST_ROOMS_ERROR:", err);
        res.status(500).json({ success: false, message: "AI extraction failed", error: err.message });
    }
};
