const { detectIntent } = require('./intentDetector');
const { buildDynamicSystemPrompt, buildUserQueryWithContext } = require('./promptBuilder');
const { generateChatCompletion } = require('./llmGateway');
const { formatAiResponse } = require('./responseFormatter');
const { buildWorkflowContext, buildWorkflowFromMemory } = require('./workflowManager');
const { decideNextAction } = require('./decisionEngine');
const { executeTool } = require('./toolExecutor');
const { loadConversationMemory, saveConversationTurn, loadUserProfile, updateUserProfile } = require('./memoryManager');
const { validateMessages, getLastUserMessage } = require('./validators');
const { processAiBookingConfirmation } = require('./bookingOrchestrator');
const {
    classifyTravelIntent,
    classifyTravelerProfile,
    detectEmotionalContext,
    evaluateInternalTelemetry
} = require('./intelligenceEngine');
const logger = require('./logger');

// ---------------------------------------------------------------------------
// Reply sanitization — strips robotic LLM artifacts post-generation
// ---------------------------------------------------------------------------

/**
 * Sanitizes any LLM output to guarantee zero robotic headers, bullet lists, or bot phrases.
 * @param {string} reply - Raw LLM output
 * @returns {string} Cleaned human-like prose
 */
function sanitizeHumanPersonaReply(reply = '') {
    if (!reply || typeof reply !== 'string') return reply;

    let text = reply;

    // 1. Remove robotic headers and strip raw hashtag # markdown headers into bold text
    text = text.replace(/#*\s*(?:🧁|🤖|⭐|📍)?\s*My\s+Recommendation[^\n]*/gi, '');
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '**$1**');

    // 2. Strip fake driver/safari/SMS claims & fake phone number placeholders
    text = text.replace(/Driver\s+Contact:[^\n]*/gi, '');
    text = text.replace(/Safari\s+Slot:[^\n]*/gi, '');
    text = text.replace(/Receipt\s+&\s+Itinerary:\s*SMS[^\n]*/gi, '');
    text = text.replace(/98765X+/gi, '');

    // 3. Remove literal italic asterisk wrappers like *(Done. Safe travels!)* or *Final hai?*
    text = text.replace(/\*\(([^)]+)\)\*/g, '$1');
    text = text.replace(/^\*([^*]+)\*$/gm, '$1');

    // 4. Remove robot boilerplate phrases
    text = text.replace(/Based on your (?:budget|criteria|search|request)[^,\.\n]*,?\s*/gi, '');
    text = text.replace(/According to your (?:budget|criteria|search|request)[^,\.\n]*,?\s*/gi, '');
    text = text.replace(/Here (?:is|are) (?:the|some) (?:top|best) (?:recommendation|recommendations|hotel|hotels)[^\.\n]*:?\s*/gi, '');

    // 5. Clean quotes around hotel names
    text = text.replace(/"([A-Z][a-zA-Z0-9\s'&.-]{2,50})"/g, '$1');

    // 4. Convert bullet points into natural prose
    const lines = text.split('\n');
    const nonBulletLines = [];
    const bulletItems = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (/^[•\-\*]\s+/.test(trimmed)) {
            const item = trimmed.replace(/^[•\-\*]\s+/, '').trim();
            if (item) bulletItems.push(item);
        } else {
            if (bulletItems.length > 0) {
                const combined = bulletItems.join(', ');
                nonBulletLines.push(combined.endsWith('.') ? combined : combined + '.');
                bulletItems.length = 0;
            }
            if (trimmed) {
                nonBulletLines.push(trimmed);
            }
        }
    }
    if (bulletItems.length > 0) {
        const combined = bulletItems.join(', ');
        nonBulletLines.push(combined.endsWith('.') ? combined : combined + '.');
    }

    text = nonBulletLines.join('\n\n');
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
}

/**
 * Strips any hallucinated bold hotel names or numbered hotel lists from LLM reply if not present in dbHotels
 */
function sanitizeHallucinatedHotels(reply = '', dbHotels = [], intent = '') {
    if (!reply || typeof reply !== 'string') return reply;

    // If dbHotels is empty and intent is HOTEL_SEARCH or ROOM_SEARCH, check if LLM listed hallucinated hotels
    if (dbHotels.length === 0 && (intent === 'HOTEL_SEARCH' || intent === 'ROOM_SEARCH')) {
        // Strip numbered hotel list items like "1. Hotel Arch..." or "1. Olivia Hotels..."
        let text = reply.replace(/^\s*\d+\.\s+\*\*?[A-Z0-9\s'&.-]+\*\*?.*$/gm, '');
        text = text.replace(/Mobile number batao\?.*$/gi, '');
        text = text.replace(/Confirmation ke liye SMS bhej deta.*$/gi, '');
        text = text.trim();

        if (!text || text.length < 20) {
            return "Hmm, is date ya filter ke liye filhal DB mein koi hotel matching nahi mil raha. Kya aap alternate dates ya budget flex karke try karna chahte hain?";
        }
        return text;
    }

    // If dbHotels exist, remove any bolded hotel name that doesn't match any DB hotel name in dbHotels
    if (dbHotels.length > 0) {
        const validNamesLower = dbHotels.map(h => (h.name || '').toLowerCase());
        const lines = reply.split('\n');
        const cleanLines = lines.filter(line => {
            const boldMatch = line.match(/\*\*([^\*]+)\*\*/);
            if (boldMatch) {
                const boldName = boldMatch[1].toLowerCase().trim();
                // Check if this bold text looks like a hotel name but isn't in dbHotels
                if (/hotel|resort|palace|plaza|inn|stay|casa|suites/i.test(boldName)) {
                    const isReal = validNamesLower.some(real => real.includes(boldName) || boldName.includes(real));
                    if (!isReal) return false; // strip hallucinated hotel line
                }
            }
            return true;
        });
        return cleanLines.join('\n');
    }

    return reply;
}

// ---------------------------------------------------------------------------
// Deterministic fallback reply builder (used when LLM is unavailable)
// ---------------------------------------------------------------------------

/**
 * Builds a deterministic fallback reply from DB data when the LLM is down.
 * @param {Array} dbHotels - Hotels from database search
 * @param {string} intent - Detected user intent
 * @returns {string}
 */
function buildDeterministicFallback(dbHotels = [], intent) {
    if (dbHotels.length > 0) {
        const top = dbHotels[0];
        return `I found ${dbHotels.length} option${dbHotels.length > 1 ? 's' : ''} for you! Check out ${top.name || 'this hotel'} in ${top.city || 'your destination'} — looks like a great fit. 🏨`;
    }
    if (intent === 'HOTEL_SEARCH' || intent === 'ROOM_SEARCH') {
        return "Let's adjust your search — try a different city or tweak the dates to find some great stays! 🏖️";
    }
    return "Hey! 😄 I had a brief hiccup connecting. What were you looking for?";
}

// ---------------------------------------------------------------------------
// Core orchestrator
// ---------------------------------------------------------------------------

/**
 * AI Orchestrator Service ("The Receptionist")
 * Coordinates intent detection → state extraction → hotel search → prompt building → LLM execution → response formatting.
 *
 * @param {{ messages: Array, userId: number|null, conversationId: string|null, userMemory: object|null }} params
 * @returns {Promise<{
 *   reply: string,
 *   hotels: Array,
 *   cards: Array,
 *   responseType: string,
 *   workflowState: string,
 *   nextRequiredSlot: string|null,
 *   nextQuestion: string|null,
 *   conversationId: string,
 *   memoryPersistence: string,
 *   action: object|null,
 *   internalSelfScore: object
 * }>}
 */
async function processUserMessage({ messages = [], userId = null, conversationId = null, userMemory = null }) {
    const normalizedMessages = validateMessages(messages);

    const lastMsg = getLastUserMessage(normalizedMessages);
    const userQuery = lastMsg.content || '';

    // 1. Build initial workflow context & load memory for context retention
    let workflow = buildWorkflowContext({ messages: normalizedMessages, intent: 'GENERAL_CHAT' });
    const memory = await loadConversationMemory({
        conversationId,
        userId,
        messages: normalizedMessages,
        derivedMemory: workflow.memory
    });

    // 2. Detect User Intent WITH active memory context (e.g. retains active hotel for date follow-ups)
    const intent = detectIntent(userQuery, normalizedMessages, memory);
    logger.info('Orchestrator', 'Detected intent', { intent });

    workflow = buildWorkflowFromMemory({ memory, intent });
    const persistentUserProfile = await loadUserProfile(userId);
    logger.info('Orchestrator', 'Workflow context', {
        workflowState: workflow.workflowState,
        memoryPersistence: memory.persistence,
        hasUserProfile: Boolean(persistentUserProfile)
    });

    // 3. Decide and run deterministic tools before asking the LLM to write
    const decision = decideNextAction({ intent, workflow, memory });
    logger.info('Orchestrator', 'Tool decision', { toolName: decision.toolName, reason: decision.reason });

    // Wrap tool execution — never let a tool crash propagate to the user
    let toolResult;
    try {
        toolResult = await executeTool({ decision, messages: normalizedMessages, memory });
    } catch (err) {
        logger.error('Orchestrator', 'Tool execution crashed', { error: err.message });
        toolResult = { toolName: decision.toolName, status: 'error', hotels: [], error: err.message };
    }

    const dbHotels = toolResult.hotels || [];
    logger.info('Orchestrator', 'Tool execution complete', {
        toolName: toolResult.toolName,
        status: toolResult.status,
        hotelCount: dbHotels.length
    });

    // =========================================================================
    // DETERMINISTIC DECISION TREE (No LLM for Infrastructure / No-Results)
    // =========================================================================

    // BRANCH 1: Database Query Failed
    if (toolResult.status === 'error') {
        logger.warn('Orchestrator', 'Database tool search failed', { error: toolResult.error });

        // Persist state even on error branches
        const persistResult = await saveConversationTurn({
            userId, messages: normalizedMessages, workflow, intent, decision,
            response: { reply: '', memory }
        });

        return {
            reply: "I'm having trouble reaching our hotel database right now. Give it a moment and try again! 🔄",
            hotels: [],
            cards: [],
            responseType: 'service_unavailable',
            workflowState: workflow.workflowState,
            nextRequiredSlot: workflow.nextRequiredSlot,
            nextQuestion: 'Would you like to try again in a moment?',
            conversationId: memory.conversationId,
            memoryPersistence: persistResult.persisted ? 'persistent' : memory.persistence,
            action: null,
            internalSelfScore: null
        };
    }

    // If 0 hotels matched exact filter, dbHotels is empty, but flow proceeds to LLM
    // so LLM generates a natural, warm conversational response instead of a robotic stock string.

    // =========================================================================
    // BRANCH 3: Hotels Exist OR General Chat -> LLM Workflow
    // =========================================================================

    // 4. Build Grounded User Query with HOTELS_DATA context
    const userQueryWithContext = buildUserQueryWithContext(userQuery, dbHotels, {
        intent,
        workflowState: workflow.workflowState,
        nextRequiredSlot: workflow.nextRequiredSlot,
        completedSlots: workflow.completedSlots,
        memory
    });

    // 5. Build Dynamic System Prompt & Call LLM Gateway
    const dynamicPrompt = buildDynamicSystemPrompt({
        intent,
        workflowState: workflow.workflowState,
        nextRequiredSlot: workflow.nextRequiredSlot,
        userMemory,
        userProfile: persistentUserProfile
    });

    let rawReply;
    try {
        rawReply = await generateChatCompletion({
            systemInstruction: dynamicPrompt,
            history: normalizedMessages.slice(0, -1),
            userQuery: userQueryWithContext
        });
    } catch (err) {
        logger.error('Orchestrator', 'LLM gateway threw', { error: err.message });
        rawReply = buildDeterministicFallback(dbHotels, intent);
    }

    let humanSanitizedReply = sanitizeHumanPersonaReply(rawReply);

    // Grounding Sanitizer: if DB hotels search had 0 results or intent was HOTEL_SEARCH/ROOM_SEARCH, ensure LLM doesn't list hallucinated fake hotels
    humanSanitizedReply = sanitizeHallucinatedHotels(humanSanitizedReply, dbHotels, intent);

    // 6. Process in-chat booking confirmation & Razorpay payment order triggers
    let finalAction = undefined;
    let finalReply = humanSanitizedReply;

    try {
        const bookingResult = await processAiBookingConfirmation({
            reply: humanSanitizedReply,
            userId,
            messages: normalizedMessages,
            memory: workflow.memory
        });
        if (bookingResult) {
            if (bookingResult.action) finalAction = bookingResult.action;
            if (bookingResult.modifiedReply) finalReply = sanitizeHumanPersonaReply(bookingResult.modifiedReply);
        }
    } catch (err) {
        logger.warn('Orchestrator', 'Booking confirmation processing error', { error: err.message });
    }

    // 7. Format Response according to contract
    const formattedResult = await formatAiResponse({
        reply: finalReply,
        lastUserQuery: userQuery,
        dbHotels,
        workflowState: workflow.workflowState,
        intent,
        actions: finalAction,
        memory,
        selectedHotel: memory.selectedHotelId ? { id: memory.selectedHotelId } : null,
        selectedRoom: memory.selectedRoomId ? { id: memory.selectedRoomId } : null
    });

    if (toolResult.flights) formattedResult.flights = toolResult.flights;
    if (toolResult.tourPackage) formattedResult.tourPackage = toolResult.tourPackage;

    // 8. Persist conversation state (runs on every successful path)
    const persistenceResult = await saveConversationTurn({
        userId,
        messages: normalizedMessages,
        workflow,
        intent,
        decision,
        response: {
            ...formattedResult,
            memory
        }
    });

    // 8b. Update long-term persistent user profile preferences
    if (userId) {
        updateUserProfile({
            userId,
            conversationMemory: memory,
            messages: normalizedMessages,
            hotelData: dbHotels[0] || null
        }).catch(err => {
            logger.warn('Orchestrator', 'Async user profile update error', { error: err.message });
        });
    }

    // 9. Internal Self-Scoring Engine (telemetry — debug level only)
    const internalSelfScore = evaluateInternalTelemetry({
        userQuery,
        finalReply,
        intent,
        actions: finalAction,
        dbHotels
    });
    logger.debug('Orchestrator', 'Telemetry snapshot', {
        stage: workflow.workflowState,
        selectedHotel: workflow.memory.selectedHotelId || null,
        selectedRoom: workflow.memory.selectedRoomId || null,
        destination: workflow.memory.destination || null,
        missingSlot: workflow.nextRequiredSlot || null,
        intent,
        selfScore: internalSelfScore
    });

    return {
        ...formattedResult,
        action: formattedResult.actions || finalAction,
        workflowState: workflow.workflowState,
        nextRequiredSlot: workflow.nextRequiredSlot,
        conversationId: memory.conversationId,
        memoryPersistence: persistenceResult.persisted ? 'persistent' : memory.persistence,
        internalSelfScore
    };
}

module.exports = {
    processUserMessage
};
