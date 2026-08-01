/**
 * GetHotel AI — Dataset Exporter & Colab Fine-Tuning Helper
 * Converts and merges 50k Conversations + 15k Formatting Datasets into Master 65k Llama 3 / Qwen / OpenAI fine-tuning JSONL format.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const FILE_50K = path.join(__dirname, '../services/ai/datasets/hotel_travel_ai_50000_conversations.jsonl');
const FILE_15K = path.join(__dirname, '../services/ai/datasets/hotel_ai_formatting_style_15000.jsonl');
const OUTPUT_FILE = path.join(__dirname, '../services/ai/datasets/llama3_travel_65k_master_formatted.jsonl');

async function convertForFineTuning() {
    console.log(`[Master FineTune Exporter] Merging 50k Conversations + 15k Formatting datasets...`);

    const outputStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });
    let totalCount = 0;
    const systemPrompt = "You are ChatGHS, the official ultra-polite Indian travel & hotel receptionist for GetHotelStays.com. Always deliver decision-critical information first, adhere to strict formatting rules (action-first, compact, card-like, bullets), and assist users with hotel bookings, room categories, pricing with GST, cancellations, and refunds without overpromising.";

    // 1. Process 50k Dataset
    if (fs.existsSync(FILE_50K)) {
        console.log(`[Master FineTune Exporter] Processing 50k Conversations dataset...`);
        const rl50 = readline.createInterface({ input: fs.createReadStream(FILE_50K), crlfDelay: Infinity });
        for await (const line of rl50) {
            if (!line.trim()) continue;
            try {
                const parsed = JSON.parse(line);
                if (parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length >= 2) {
                    const formatted = {
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...parsed.messages.map(m => ({
                                role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
                                content: m.content || ''
                            }))
                        ]
                    };
                    outputStream.write(JSON.stringify(formatted) + '\n');
                    totalCount++;
                }
            } catch (e) {}
        }
    }

    // 2. Process 15k Formatting Dataset
    if (fs.existsSync(FILE_15K)) {
        console.log(`[Master FineTune Exporter] Processing 15k Formatting supervision dataset...`);
        const rl15 = readline.createInterface({ input: fs.createReadStream(FILE_15K), crlfDelay: Infinity });
        for await (const line of rl15) {
            if (!line.trim()) continue;
            try {
                const parsed = JSON.parse(line);
                if (parsed.user_message && parsed.ideal_response) {
                    const formatted = {
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: parsed.user_message },
                            { role: "assistant", content: parsed.ideal_response }
                        ]
                    };
                    outputStream.write(JSON.stringify(formatted) + '\n');
                    totalCount++;
                }
            } catch (e) {}
        }
    }

    outputStream.end();
    console.log(`[Master FineTune Exporter] Successfully merged ${totalCount} master items to: ${OUTPUT_FILE}`);
    console.log(`[Master FineTune Exporter] File ready for Google Colab / Unsloth Llama-3 Fine-Tuning! 🚀`);
}

convertForFineTuning();
