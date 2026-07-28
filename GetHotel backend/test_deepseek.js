require('dotenv').config();
const fetch = globalThis.fetch;

async function test() {
    const key = process.env.OPENROUTER_API_KEY;
    console.log("Using key:", key ? (key.slice(0, 15) + "...") : "none");

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://gethotelstays.com',
            'X-Title': 'ChatGHS'
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a travel assistant. Talk like a dynamic friend.' },
                { role: 'user', content: 'hey' }
            ],
            temperature: 0.7,
            max_tokens: 100
        })
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
