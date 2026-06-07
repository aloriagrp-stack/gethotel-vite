const fs = require('fs');
const path = require('path');

/**
 * Enterprise-grade Security & Admin Activity Logger
 * Logs administrative actions to a secure, write-append JSON file.
 */
const logAdminActivity = (adminUser, action, details, req) => {
    try {
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logPath = path.join(logDir, 'security_audit.log');
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || 'unknown';

        const logEntry = {
            timestamp: new Date().toISOString(),
            adminId: adminUser ? adminUser.id : 'anonymous',
            adminEmail: adminUser ? adminUser.email : 'anonymous',
            role: adminUser ? adminUser.role : 'unknown',
            action,
            details,
            ip,
            device: userAgent
        };

        // Append log entry as a single line in JSONL format
        fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
        console.log(`[AUDIT] Action: ${action} | Admin: ${logEntry.adminEmail} | IP: ${ip}`);
    } catch (err) {
        console.error('[AUDIT LOG FAILURE] Failed to write audit log:', err);
    }
};

module.exports = { logAdminActivity };
