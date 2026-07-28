const crypto = require('crypto');
const prisma = require('../../config/db');
const logger = require('./logger');

let memoryTablesAvailable = null;

function safeJsonParse(value, fallback) {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function mergeMemory(storedMemory = {}, derivedMemory = {}) {
    const merged = { ...storedMemory };
    for (const [key, value] of Object.entries(derivedMemory || {})) {
        if (value !== null && value !== undefined && value !== '') {
            merged[key] = value;
        }
    }
    return merged;
}

/**
 * Applies logged-in user profile defaults to merged memory (name, email, phone).
 * Only fills in fields that are not already present.
 * @param {object} merged - Merged memory object
 * @param {object} loggedInDetails - Profile fields from DB
 * @returns {object} The mutated merged object
 */
function applyLoggedInDefaults(merged, loggedInDetails) {
    if (loggedInDetails.guestName && !merged.guestName) merged.guestName = loggedInDetails.guestName;
    if (loggedInDetails.guestEmail && !merged.guestEmail) merged.guestEmail = loggedInDetails.guestEmail;
    if (loggedInDetails.guestPhone && !merged.guestPhone) merged.guestPhone = loggedInDetails.guestPhone;
    return merged;
}

function resolveConversationId({ conversationId, userId, messages = [] }) {
    if (conversationId) return String(conversationId).slice(0, 191);

    const firstUserMessage = messages.find(message => (message.role || message.sender) === 'user');
    const seed = `${userId || 'anonymous'}:${firstUserMessage?.content || firstUserMessage?.text || 'default'}`;
    const hash = crypto.createHash('sha1').update(seed).digest('hex').slice(0, 24);
    return `ai_${hash}`;
}

async function hasMemoryTables() {
    if (memoryTablesAvailable !== null) return memoryTablesAvailable;

    try {
        const rows = await prisma.$queryRaw`
            SELECT COUNT(*) AS count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name IN ('ai_conversation', 'ai_conversation_memory')
        `;
        const count = Number(rows?.[0]?.count || 0);
        memoryTablesAvailable = count === 2;
    } catch (err) {
        logger.warn('Memory', 'Could not inspect AI memory tables', { message: err.message });
        memoryTablesAvailable = false;
    }

    return memoryTablesAvailable;
}

async function loadConversationMemory({ conversationId, userId, messages = [], derivedMemory }) {
    const resolvedConversationId = resolveConversationId({ conversationId, userId, messages });

    let loggedInDetails = {};
    if (userId) {
        try {
            const parsedUserId = parseInt(userId);
            if (!isNaN(parsedUserId)) {
                const dbUser = await prisma.user.findUnique({ where: { id: parsedUserId } });
                if (dbUser) {
                    loggedInDetails.guestName = dbUser.name;
                    loggedInDetails.guestEmail = dbUser.email;
                    
                    const lastBooking = await prisma.booking.findFirst({
                        where: { userId: parsedUserId },
                        orderBy: { id: 'desc' }
                    });
                    if (lastBooking && lastBooking.guestPhone) {
                        loggedInDetails.guestPhone = lastBooking.guestPhone;
                    }
                }
            }
        } catch (dbErr) {
            logger.warn('Memory', 'Error fetching user profile details', { message: dbErr.message });
        }
    }

    if (!(await hasMemoryTables())) {
        const merged = mergeMemory({}, derivedMemory);
        applyLoggedInDefaults(merged, loggedInDetails);
        return {
            ...merged,
            conversationId: resolvedConversationId,
            persistence: 'derived'
        };
    }

    try {
        const rows = await prisma.$queryRaw`
            SELECT memoryJson
            FROM ai_conversation_memory
            WHERE conversationId = ${resolvedConversationId}
            LIMIT 1
        `;

        const storedMemory = rows?.[0]?.memoryJson
            ? safeJsonParse(rows[0].memoryJson, {})
            : {};

        const merged = mergeMemory(storedMemory, derivedMemory);
        applyLoggedInDefaults(merged, loggedInDetails);

        return {
            ...merged,
            conversationId: resolvedConversationId,
            persistence: 'persistent'
        };
    } catch (err) {
        logger.warn('Memory', 'Falling back to derived memory', { message: err.message });
        const merged = mergeMemory({}, derivedMemory);
        applyLoggedInDefaults(merged, loggedInDetails);
        return {
            ...merged,
            conversationId: resolvedConversationId,
            persistence: 'derived'
        };
    }
}

async function saveConversationTurn({ userId, messages = [], workflow, intent, decision, response }) {
    const memory = response?.memory || workflow?.memory || {};
    const conversationId = memory.conversationId || resolveConversationId({ userId, messages });

    if (!(await hasMemoryTables())) {
        return {
            persisted: false,
            reason: 'AI memory tables are not migrated yet.'
        };
    }

    try {
        const firstUserMessage = messages.find(message => (message.role || message.sender) === 'user');
        const title = (firstUserMessage?.content || firstUserMessage?.text || 'AI conversation').slice(0, 120);
        const memoryJson = JSON.stringify({
            ...mergeMemory(memory, workflow.memory),
            conversationId
        });

        await prisma.$executeRaw`
            INSERT INTO ai_conversation (id, userId, title)
            VALUES (${conversationId}, ${userId || null}, ${title})
            ON DUPLICATE KEY UPDATE
                userId = VALUES(userId),
                title = COALESCE(title, VALUES(title)),
                updatedAt = CURRENT_TIMESTAMP(3)
        `;

        await prisma.$executeRaw`
            INSERT INTO ai_conversation_memory (
                conversationId, workflowState, nextRequiredSlot, memoryJson, lastIntent, lastAction
            )
            VALUES (
                ${conversationId},
                ${workflow.workflowState},
                ${workflow.nextRequiredSlot || null},
                ${memoryJson},
                ${intent || null},
                ${decision?.toolName || null}
            )
            ON DUPLICATE KEY UPDATE
                workflowState = VALUES(workflowState),
                nextRequiredSlot = VALUES(nextRequiredSlot),
                memoryJson = VALUES(memoryJson),
                lastIntent = VALUES(lastIntent),
                lastAction = VALUES(lastAction),
                updatedAt = CURRENT_TIMESTAMP(3)
        `;

        return {
            persisted: true,
            conversationId
        };
    } catch (err) {
        logger.warn('Memory', 'Failed to persist AI memory', { message: err.message });
        return {
            persisted: false,
            reason: err.message
        };
    }
}

/**
 * Loads the persistent user preference profile from ai_user_profile table.
 * Returns null for anonymous users or if table doesn't exist yet.
 *
 * @param {number|null} userId
 * @returns {Promise<object|null>} Parsed preference profile or null
 */
async function loadUserProfile(userId) {
    if (!userId) return null;

    try {
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId)) return null;

        const row = await prisma.ai_user_profile.findUnique({
            where: { userId: parsedUserId }
        });

        if (!row || !row.preferencesJson) return null;

        return safeJsonParse(row.preferencesJson, null);
    } catch (err) {
        // Table might not exist yet or DB is down — degrade gracefully
        logger.debug('Memory', 'Could not load user profile', { error: err.message });
        return null;
    }
}

/**
 * Updates (upserts) the user's persistent preference profile.
 * Merges new learnings from this conversation with existing profile.
 *
 * @param {{ userId: number|null, conversationMemory: object, messages: Array, hotelData: object|null }} params
 * @returns {Promise<boolean>} true if persisted, false if skipped/failed
 */
async function updateUserProfile({ userId, conversationMemory = {}, messages = [], hotelData = null }) {
    if (!userId) return false;

    try {
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId)) return false;

        const { extractAndMergePreferences } = require('./preferenceExtractor');

        // Load existing profile
        const existingProfile = await loadUserProfile(parsedUserId);

        // Extract and merge new preferences
        const updatedProfile = extractAndMergePreferences({
            existingProfile,
            conversationMemory,
            messages,
            hotelData
        });

        const profileJson = JSON.stringify(updatedProfile);

        // Upsert — create if new, update if exists
        await prisma.ai_user_profile.upsert({
            where: { userId: parsedUserId },
            create: {
                userId: parsedUserId,
                preferencesJson: profileJson,
                totalBookings: updatedProfile.bookingCount || 0,
                lastLearnedAt: new Date()
            },
            update: {
                preferencesJson: profileJson,
                totalBookings: updatedProfile.bookingCount || 0,
                lastLearnedAt: new Date()
            }
        });

        logger.info('Memory', 'User profile updated', {
            userId: parsedUserId,
            cities: updatedProfile.preferredCities?.length || 0,
            bookingCount: updatedProfile.bookingCount || 0
        });

        return true;
    } catch (err) {
        logger.warn('Memory', 'Failed to update user profile', { error: err.message });
        return false;
    }
}

module.exports = {
    loadConversationMemory,
    saveConversationTurn,
    loadUserProfile,
    updateUserProfile
};
