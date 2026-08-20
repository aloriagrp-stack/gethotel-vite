require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');
const logger = require('./logger');

/** Per-provider request timeout in milliseconds */
const LLM_TIMEOUT_MS = 15_000;

/**
 * Creates an AbortSignal that times out after the given ms.
 * Uses native AbortSignal.timeout where available, falls back to manual controller.
 * @param {number} ms
 * @returns {AbortSignal}
 */
function createTimeoutSignal(ms) {
    if (typeof AbortSignal.timeout === 'function') {
        return AbortSignal.timeout(ms);
    }
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
}

/**
 * Helper to execute Gemini requests with retries and fallback models.
 * @param {object} genAI - GoogleGenerativeAI instance
 * @param {object} options - Model configuration
 * @param {Function} executeFn - Async function receiving the model instance
 * @returns {Promise<object>}
 */
const runGeminiWithFallback = async (genAI, options, executeFn) => {
    const modelsToTry = [
        options.model || 'gemini-2.5-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
    ];
    const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));

    let lastError = null;
    for (const modelName of uniqueModels) {
        try {
            logger.debug('LLMGateway', 'Attempting Gemini model', { model: modelName });
            const modelConfig = { ...options, model: modelName };
            const model = genAI.getGenerativeModel(modelConfig);

            const result = await executeFn(model);
            logger.info('LLMGateway', 'Gemini model succeeded', { model: modelName });
            return result;
        } catch (err) {
            console.error(`[LLM DEBUG Gemini model ${modelName} Error]:`, err.message);
            logger.warn('LLMGateway', 'Gemini model failed', { model: modelName, error: err.message });
            lastError = err;
            const isRateLimit = err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('limit'));
            if (isRateLimit) {
                logger.info('LLMGateway', 'Rate limited, rotating to next fallback', { model: modelName });
            }
        }
    }
    throw lastError;
};

/**
 * Builds an OpenAI-compatible messages array from system instruction + history + user query.
 * @param {string} systemInstruction
 * @param {Array} history
 * @param {string} userQuery
 * @returns {Array<{ role: string, content: string }>}
 */
function buildOpenAIMessages(systemInstruction, history, userQuery) {
    const messages = [{ role: 'system', content: systemInstruction }];

    (history || []).forEach(m => {
        const role = m.role === 'ai' || m.role === 'model' || m.sender === 'ai' ? 'assistant' : 'user';
        const content = m.content || m.text || '';
        if (content.trim()) {
            messages.push({ role, content });
        }
    });

    messages.push({ role: 'user', content: userQuery });
    return messages;
}

/**
 * Generic OpenAI-compatible API caller with timeout.
 * @param {{ url: string, apiKey: string, model: string, messages: Array, headers?: Record<string,string>, label: string }} opts
 * @returns {Promise<string|null>} Reply text or null on failure
 */
async function callOpenAICompatible({ url, apiKey, model, messages, headers = {}, label }) {
    if (!apiKey) return null;

    try {
        const cleanKey = (apiKey || '').replace(/^["']|["']$/g, '').trim();
        logger.debug('LLMGateway', `Calling ${label}`, { model });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cleanKey}`,
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7,
                max_tokens: 1024
            }),
            signal: createTimeoutSignal(LLM_TIMEOUT_MS)
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => 'Unable to read error body');
            console.error(`[LLM DEBUG] ${label} HTTP ${response.status} Error:`, errText);
            logger.warn('LLMGateway', `${label} HTTP error`, { status: response.status, error: errText.slice(0, 200) });
            return null;
        }

        const data = await response.json();
        const replyText = data.choices?.[0]?.message?.content;
        if (replyText) {
            logger.info('LLMGateway', `${label} succeeded`, { model });
            return replyText;
        }

        logger.warn('LLMGateway', `${label} returned empty content`, { model });
        return null;
    } catch (err) {
        const isTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
        logger.warn('LLMGateway', `${label} ${isTimeout ? 'timed out' : 'failed'}`, { model, error: err.message });
        return null;
    }
}

/**
 * Call DeepSeek V3 via OpenRouter as the primary chat model.
 */
const callDeepSeekOpenRouter = async ({ systemInstruction, history = [], userQuery }) => {
    return callOpenAICompatible({
        url: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey: process.env.OPENROUTER_API_KEY,
        model: 'deepseek/deepseek-chat',
        messages: buildOpenAIMessages(systemInstruction, history, userQuery),
        headers: {
            'HTTP-Referer': 'https://gethotelstays.com',
            'X-Title': 'ChatGHS'
        },
        label: 'DeepSeek-OpenRouter'
    });
};

/**
 * Fallback to Groq API (Llama-3.3-70B).
 */
const callGroqFallback = async ({ systemInstruction, history = [], userQuery }) => {
    return callOpenAICompatible({
        url: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile',
        messages: buildOpenAIMessages(systemInstruction, history, userQuery),
        label: 'Groq-Llama'
    });
};

/**
 * Fallback to OpenRouter Auto.
 */
const callOpenRouterFallback = async ({ systemInstruction, history = [], userQuery }) => {
    return callOpenAICompatible({
        url: 'https://openrouter.ai/api/v1/chat/completions',
        apiKey: process.env.OPENROUTER_API_KEY,
        model: 'openrouter/auto',
        messages: buildOpenAIMessages(systemInstruction, history, userQuery),
        headers: {
            'HTTP-Referer': 'https://gethotelstays.com',
            'X-Title': 'ChatGHS'
        },
        label: 'OpenRouter-Auto'
    });
};

/** Static fallback reply when all LLM providers are down */
const ALL_PROVIDERS_DOWN_REPLY = "Hey! 😄 I had a brief connection hiccup. Ask me again and I'll get right on it!";

/**
 * Generate chat completion using DeepSeek (OpenRouter) → Gemini → Groq → OpenRouter auto chain.
 *
 * @param {{ systemInstruction: string, history: Array, userQuery: string }} params
 * @returns {Promise<string>} LLM reply text (never null — falls back to static string)
 */
const generateChatCompletion = async ({ systemInstruction, history = [], userQuery }) => {
    // 1. Try Groq (Superfast Llama-3.3-70B) first
    try {
        const groqReply = await callGroqFallback({ systemInstruction, history, userQuery });
        if (groqReply) return groqReply;
    } catch (err) {
        console.error('[LLM DEBUG] Groq error:', err.message);
    }

    // 2. Try DeepSeek via OpenRouter
    try {
        const deepseekReply = await callDeepSeekOpenRouter({ systemInstruction, history, userQuery });
        if (deepseekReply) return deepseekReply;
    } catch (err) {
        console.error('[LLM DEBUG] DeepSeek error:', err.message);
    }

    // 3. Fallback to Gemini with valid models
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const formattedHistory = history.map(m => ({
                role: m.role === 'ai' || m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.content || m.text || '' }]
            }));

            const geminiModelName = process.env.GEMINI_TUNED_MODEL_ID || 'gemini-1.5-flash';
            const result = await runGeminiWithFallback(
                genAI,
                { model: geminiModelName, systemInstruction },
                async (model) => {
                    const chat = model.startChat({ history: formattedHistory });
                    return await chat.sendMessage(userQuery);
                }
            );

            return result.response.text();
        } catch (err) {
            console.error('[LLM DEBUG] Gemini error:', err.message);
        }
    }

    // 4. Fallback to OpenRouter Auto
    try {
        const openrouterReply = await callOpenRouterFallback({ systemInstruction, history, userQuery });
        if (openrouterReply) return openrouterReply;
    } catch (err) {
        console.error('[LLM DEBUG] OpenRouter auto error:', err.message);
    }

    logger.error('LLMGateway', 'All LLM providers failed — returning static fallback');
    return ALL_PROVIDERS_DOWN_REPLY;
};

/**
 * Generate structured JSON using Gemini (for slot extraction, etc.).
 *
 * @param {{ systemInstruction: string, prompt: string, schema: object, temperature?: number }} params
 * @returns {Promise<string|null>} JSON string or null on failure
 */
const generateStructuredJSON = async ({ systemInstruction, prompt, schema, temperature = 0.1 }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.error('LLMGateway', 'Missing GEMINI_API_KEY for structured JSON generation');
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const result = await runGeminiWithFallback(
            genAI,
            {
                model: 'gemini-2.5-flash',
                systemInstruction,
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature
                }
            },
            (model) => model.generateContent(prompt)
        );

        return result.response.text();
    } catch (err) {
        logger.error('LLMGateway', 'Structured JSON generation failed', { error: err.message });
        return null;
    }
};

module.exports = {
    runGeminiWithFallback,
    generateChatCompletion,
    generateStructuredJSON
};
