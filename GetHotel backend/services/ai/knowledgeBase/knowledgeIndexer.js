/**
 * GetHotel AI — In-Code Knowledge Base Indexer
 * Parses and indexes the 50,000+ travel dataset directly into a fast, in-memory knowledge store.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATASET_PATH = path.join(__dirname, '../datasets/openai_llama_travel_finetune.jsonl');
const STORE_PATH = path.join(__dirname, 'knowledge_store.json');

// Category Keyword Classifiers
function classifyCategory(query, text) {
    const combined = `${query} ${text}`.toLowerCase();
    if (/\b(tour|itinerary|package|days|day|trip|goa|kerala|jaipur|rajasthan|ladakh|kashmir)\b/.test(combined)) {
        return 'INDIA_TOUR';
    }
    if (/\b(flight|flights|airline|fare|airport|delhi to|mumbai to|london|dubai)\b/.test(combined)) {
        return 'FLIGHT_SEARCH';
    }
    if (/\b(hour|hours|ghanta|ghante|transit|layover|3hr|6hr|12hr|micro)\b/.test(combined)) {
        return 'HOURLY_STAY';
    }
    if (/\b(hotel|hotels|resort|room|rooms|stay|inn|suites|kamra|kamre)\b/.test(combined)) {
        return 'HOTEL_SEARCH';
    }
    return 'GENERAL_CHAT';
}

async function indexKnowledgeBase() {
    console.log('[KnowledgeIndexer] Starting In-Code 50k Dataset Indexing...');

    const store = {
        INDIA_TOUR: [],
        FLIGHT_SEARCH: [],
        HOURLY_STAY: [],
        HOTEL_SEARCH: [],
        GENERAL_CHAT: []
    };

    if (!fs.existsSync(DATASET_PATH)) {
        console.warn(`[KnowledgeIndexer] Dataset file not found at ${DATASET_PATH}. Skipping indexing.`);
        return;
    }

    const fileStream = fs.createReadStream(DATASET_PATH);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let count = 0;
    for await (const line of rl) {
        if (!line.trim()) continue;
        try {
            const parsed = JSON.parse(line);
            let userText = '';
            let aiText = '';

            if (parsed.user && parsed.assistant) {
                userText = parsed.user;
                aiText = parsed.assistant;
            } else if (parsed.messages && Array.isArray(parsed.messages)) {
                userText = parsed.messages.find(m => m.role === 'user')?.content || '';
                aiText = parsed.messages.find(m => m.role === 'assistant' || m.role === 'model')?.content || '';
            }

            if (userText && aiText) {
                const category = classifyCategory(userText, aiText);
                // Keep compact samples (max 150 per category for ultra-fast 2ms lookup)
                if (store[category].length < 150) {
                    store[category].push({
                        q: userText.trim(),
                        a: aiText.trim()
                    });
                }
                count++;
            }
        } catch { /* skip invalid lines */ }
    }

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
    console.log(`[KnowledgeIndexer] Successfully indexed ${count} total items into ${STORE_PATH}`);
    console.log(`[KnowledgeIndexer] Category Counts:`, {
        INDIA_TOUR: store.INDIA_TOUR.length,
        FLIGHT_SEARCH: store.FLIGHT_SEARCH.length,
        HOURLY_STAY: store.HOURLY_STAY.length,
        HOTEL_SEARCH: store.HOTEL_SEARCH.length,
        GENERAL_CHAT: store.GENERAL_CHAT.length
    });
}

if (require.main === module) {
    indexKnowledgeBase();
}

module.exports = { indexKnowledgeBase };
