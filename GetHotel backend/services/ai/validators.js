/**
 * Validation helpers for AI orchestration inputs and state.
 * Guards against oversized payloads, malformed messages, and injection vectors.
 *
 * @module validators
 */

/** Maximum character length for a single user message content */
const MAX_MESSAGE_LENGTH = 10000;

/** Maximum number of messages accepted per request */
const MAX_MESSAGES_COUNT = 50;

/**
 * Normalizes a single message object to a consistent shape.
 * @param {object} message - Raw message from client
 * @returns {{ role: string, content: string }}
 */
function normalizeMessage(message) {
    if (!message || typeof message !== 'object') {
        return { role: 'user', content: '' };
    }

    const role = message.role || message.sender || 'user';
    let content = message.content || message.text || '';
    content = typeof content === 'string' ? content : String(content || '');

    // Truncate oversized messages to prevent prompt injection and ReDoS
    if (content.length > MAX_MESSAGE_LENGTH) {
        content = content.slice(0, MAX_MESSAGE_LENGTH);
    }

    return {
        ...message,
        role,
        content
    };
}

/**
 * Validates and normalizes the messages array from the client payload.
 * @param {Array} messages - Raw messages array from request body
 * @returns {Array<{ role: string, content: string }>} Normalized, filtered messages
 * @throws {Error} If messages payload is empty or not an array
 */
function validateMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Messages payload must not be empty.');
    }

    // Cap the number of messages to prevent memory/CPU abuse
    const capped = messages.slice(-MAX_MESSAGES_COUNT);

    return capped.map(normalizeMessage).filter(message => message.content.trim().length > 0);
}

/**
 * Returns the last user-role message from a normalized messages array.
 * @param {Array<{ role: string, content: string }>} messages
 * @returns {{ role: string, content: string }}
 */
function getLastUserMessage(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
        const role = messages[i].role || messages[i].sender;
        if (role === 'user') {
            return messages[i];
        }
    }
    return messages[messages.length - 1];
}

module.exports = {
    MAX_MESSAGE_LENGTH,
    MAX_MESSAGES_COUNT,
    normalizeMessage,
    validateMessages,
    getLastUserMessage
};
