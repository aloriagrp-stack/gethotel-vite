/**
 * GetHotel AI — Multi-Provider Fine-Tuning Pipeline
 *
 * Generates and exports standardized JSONL training datasets for:
 * 1. Google Gemini (Google AI Studio / Vertex AI)
 * 2. Together AI / Anyscale / Groq (Llama-3.3-70B)
 * 3. OpenAI / OpenRouter Custom Fine-Tuned Endpoints
 *
 * Usage:
 *   node services/ai/fineTunePipeline.js
 */

const fs = require('fs');
const path = require('path');
const prisma = require('../../config/db');

// Sample High-Quality Synthetic & DB Travel Training Pairs
const BASE_TRAVEL_DATASET = [
    // 1. Hotel Searches & Budget Scenarios
    {
        user: "Jaipur me budget hotel dikha under 3000 rupees",
        assistant: "Aapke liye Jaipur me ₹3,000 ke under best rated budget hotels:\n\n**1. Hotel Cottage Yes Please** — ⭐ 4.2 | ₹1,800/night\n📍 Near Railway Station | AC Room, Free WiFi, Breakfast Included\n\n**2. Hotel Arch Jaipur** — ⭐ 4.0 | ₹2,200/night\n📍 Malviya Nagar | Deluxe Room, Rooftop Restaurant\n\nKonse hotel ke rooms dekhna chahenge aap? 🏨"
    },
    {
        user: "Show 5-star luxury resorts in Udaipur for couples",
        assistant: "Here are top-rated 5-Star Luxury Resorts in Udaipur for a memorable couple stay:\n\n**1. Taj Lake Palace** — ⭐ 4.9 | ₹24,000/night\n📍 Lake Pichola | Lake View Suite, Candlelight Dining, Spa\n\n**2. The Leela Palace Udaipur** — ⭐ 4.8 | ₹22,500/night\n📍 Royal Courtyard | Heritage Pool, Private Butler Service\n\nWhich resort would you like to explore for dates and availability?"
    },
    // 2. Micro-Stays / Hourly Transit Rooms
    {
        user: "Aerocity Delhi me 6 ghante ke liye transit room chahiye",
        assistant: "Aerocity Delhi me 6-hour micro-stay transit rooms:\n\n**1. Hotel Crystal Deluxe Aerocity**\n⏱️ **6-Hour Transit Package**: ₹1,200 (Normal 24hr rate: ₹3,200)\n📍 5 mins from IGI Airport T3 | Free Airport Transfer & High-Speed WiFi\n\n**2. Holiday Inn Express Aerocity**\n⏱️ **6-Hour Flexi Stay**: ₹1,800\n📍 T3 Terminal Walking Distance | Express Check-in & Shower Facility\n\nKaunsa time slot aap booking ke liye confirm karna chahenge?"
    },
    // 3. India Custom Tour Packages (Zero Hashtags Rule)
    {
        user: "Goa 4 days customized tour package banana budget me",
        assistant: "Aapka 4-Day Customized Goa Budget Tour Package:\n\n**Day 1: North Goa Beaches & Sunset**\n• Morning: Calangute & Baga Beach stroll\n• Afternoon: Fort Aguada exploration\n• Evening: Tito's Lane nightlife & beachside shack dinner\n\n**Day 2: South Goa Heritage & Cruise**\n• Morning: Basilica of Bom Jesus & Se Cathedral\n• Afternoon: Miramar Beach\n• Evening: Mandovi River Sunset Cruise with Goan Folk Dance\n\n**Day 3: Water Sports & Adventure**\n• Morning: Parasailing & Jet Ski at Anjuna Beach\n• Afternoon: Chapora Fort (Dil Chahta Hai point)\n• Evening: Vagator sunset view\n\n**Day 4: Dudhsagar Waterfalls & Spice Plantation**\n• Morning: Jeep Safari to Dudhsagar Waterfalls\n• Afternoon: Authentic Goan Spice Plantation tour & traditional lunch\n• Evening: Departure with sweet memories\n\n**All-Inclusive Price Quote**:\n• ₹9,500 per person (Includes 3-Star Hotel Stay + Breakfast + AC Car + River Cruise Ticket)\n\nKya aap isme dates set karke booking proceed karna chahte hain? 🌴"
    },
    // 4. Worldwide Flight Queries
    {
        user: "Delhi to London cheapest flight fares for August",
        assistant: "Here are the lowest flight options for Delhi (DEL) to London (LHR):\n\n✈️ **British Airways (Direct)**\n• Departure: 08:15 AM (DEL) ➔ Arrival: 01:20 PM (LHR)\n• Duration: 9h 35m Non-Stop\n• Fare: **₹38,500** per passenger (Lowest Fare Badge 🏷️)\n\n✈️ **Virgin Atlantic (Direct)**\n• Departure: 02:00 PM (DEL) ➔ Arrival: 06:50 PM (LHR)\n• Duration: 9h 20m Non-Stop\n• Fare: **₹41,200** per passenger\n\nWould you like me to reserve seats or check return flight options?"
    }
];

/**
 * Format dataset into Google Gemini Fine-Tuning JSONL
 */
function exportGeminiJSONL(dataset, outputPath) {
    const lines = dataset.map(item => JSON.stringify({
        messages: [
            { role: "user", parts: [{ text: item.user }] },
            { role: "model", parts: [{ text: item.assistant }] }
        ]
    }));
    fs.writeFileSync(outputPath, lines.join('\n'));
    console.log(`[FineTunePipeline] Exported ${dataset.length} samples to Gemini format: ${outputPath}`);
}

/**
 * Format dataset into Together AI / OpenAI / Llama-3 Fine-Tuning JSONL
 */
function exportOpenAIJSONL(dataset, outputPath) {
    const lines = dataset.map(item => JSON.stringify({
        messages: [
            { role: "system", content: "You are ChatGHS, the world's most intelligent AI Travel Concierge for Hotels, Flights, Micro-Stays, and India Tours." },
            { role: "user", content: item.user },
            { role: "assistant", content: item.assistant }
        ]
    }));
    fs.writeFileSync(outputPath, lines.join('\n'));
    console.log(`[FineTunePipeline] Exported ${dataset.length} samples to OpenAI/Llama format: ${outputPath}`);
}

async function runPipeline() {
    console.log("=================================================");
    console.log("🚀 GETMOTEL AI: MULTI-PROVIDER FINE-TUNING PIPELINE");
    console.log("=================================================");

    const outputDir = path.join(__dirname, 'datasets');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Try fetching successful DB conversations if available
    let dbDataset = [];
    try {
        const dbConvs = await prisma.ai_conversation.findMany({
            take: 200,
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        dbConvs.forEach(conv => {
            const msgs = conv.messages;
            for (let i = 0; i < msgs.length - 1; i++) {
                if (msgs[i].role === 'user' && msgs[i + 1].role === 'ai') {
                    dbDataset.push({
                        user: msgs[i].content,
                        assistant: msgs[i + 1].content
                    });
                }
            }
        });
        console.log(`[FineTunePipeline] Extracted ${dbDataset.length} live user conversations from Database.`);
    } catch {
        console.log("[FineTunePipeline] Note: Database extraction skipped, using gold-standard synthetic travel dataset.");
    }

    // Scan for external JSONL files (e.g., from Claude or custom exports)
    let externalDataset = [];
    const files = fs.readdirSync(outputDir);
    const readline = require('readline');

    for (const file of files) {
        if (file.endsWith('.jsonl') && !file.includes('_finetune.jsonl')) {
            const filePath = path.join(outputDir, file);
            try {
                const fileStream = fs.createReadStream(filePath);
                const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

                let count = 0;
                for await (const line of rl) {
                    if (!line.trim()) continue;
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.user && parsed.assistant) {
                            externalDataset.push({ user: parsed.user, assistant: parsed.assistant });
                            count++;
                        } else if (parsed.messages && Array.isArray(parsed.messages)) {
                            const u = parsed.messages.find((m) => m.role === 'user')?.content || parsed.messages.find((m) => m.role === 'user')?.parts?.[0]?.text;
                            const a = parsed.messages.find((m) => m.role === 'assistant' || m.role === 'model')?.content || parsed.messages.find((m) => m.role === 'model')?.parts?.[0]?.text;
                            if (u && a) {
                                externalDataset.push({ user: u, assistant: a });
                                count++;
                            }
                        }
                    } catch { /* skip corrupted lines */ }
                }
                console.log(`[FineTunePipeline] Loaded ${count} external dataset items from ${file}`);
            } catch (err) {
                console.error(`[FineTunePipeline] Error reading ${file}:`, err.message);
            }
        }
    }

    const fullDataset = [...BASE_TRAVEL_DATASET, ...dbDataset, ...externalDataset];

    // Export for Gemini API
    const geminiPath = path.join(outputDir, 'gemini_travel_finetune.jsonl');
    exportGeminiJSONL(fullDataset, geminiPath);

    // Export for Together AI / OpenAI / Groq
    const openaiPath = path.join(outputDir, 'openai_llama_travel_finetune.jsonl');
    exportOpenAIJSONL(fullDataset, openaiPath);

    console.log("\n=================================================");
    console.log("✅ FINE-TUNING DATASET GENERATION COMPLETE");
    console.log("=================================================");
    console.log(`📍 Total Conversations Bundled: ${fullDataset.length}`);
    console.log(`📍 Gemini Dataset: ${geminiPath}`);
    console.log(`📍 Together/Llama Dataset: ${openaiPath}`);
}

if (require.main === module) {
    runPipeline();
}

module.exports = { runPipeline };
