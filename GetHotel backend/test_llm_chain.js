const { generateChatCompletion } = require('./services/ai/llmGateway');

async function testFullLLM() {
    console.log('Testing generateChatCompletion via Groq/LLMGateway...');
    try {
        const reply = await generateChatCompletion({
            systemInstruction: 'You are ChatGHS AI.',
            history: [],
            userQuery: 'Jaipur me 3 days tour package dikha'
        });
        console.log('LLM Reply Success:\n', reply);
    } catch (err) {
        console.error('LLM Test Failed:', err);
    }
}

testFullLLM();
