/**
 * Structured AI Logger
 * Outputs machine-parseable JSON logs with timestamps for production observability.
 * Log level controlled by AI_LOG_LEVEL env var (debug | info | warn | error). Default: info.
 *
 * @module logger
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[(process.env.AI_LOG_LEVEL || 'info').toLowerCase()] ?? LOG_LEVELS.info;

/**
 * @param {'debug'|'info'|'warn'|'error'} level
 * @param {string} scope - Module name (e.g. 'Orchestrator', 'LLMGateway')
 * @param {string} message - Human-readable event description
 * @param {Record<string, unknown>} [meta] - Structured key-value pairs (no PII)
 */
function emit(level, scope, message, meta) {
    if (LOG_LEVELS[level] < CURRENT_LEVEL) return;

    const entry = {
        ts: new Date().toISOString(),
        level,
        scope: `AI:${scope}`,
        msg: message
    };

    if (meta !== undefined && meta !== null) {
        // Shallow-copy meta to avoid mutating caller's object
        Object.assign(entry, typeof meta === 'object' && !Array.isArray(meta) ? meta : { data: meta });
    }

    const line = JSON.stringify(entry);

    switch (level) {
        case 'error': console.error(line); break;
        case 'warn':  console.warn(line);  break;
        default:      console.log(line);   break;
    }
}

function debug(scope, message, meta) { emit('debug', scope, message, meta); }
function info(scope, message, meta)  { emit('info',  scope, message, meta); }
function warn(scope, message, meta)  { emit('warn',  scope, message, meta); }
function error(scope, message, meta) { emit('error', scope, message, meta); }

module.exports = { debug, info, warn, error };
