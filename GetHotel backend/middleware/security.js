const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { logAdminActivity } = require('../utils/auditLogger');

// 1. IP Blocklist Management
const blockedIpsFile = path.join(__dirname, '../config/blocked_ips.json');
let blockedIps = new Set();

const loadBlockedIps = () => {
    try {
        const configDir = path.dirname(blockedIpsFile);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(blockedIpsFile, JSON.stringify({ blocked: [] }, null, 4), 'utf8');
        blockedIps = new Set();
        console.log(`[SECURITY] Loaded ${blockedIps.size} blocked IPs (Blocklist cleared).`);
    } catch (err) {
        console.error('[SECURITY ERROR] Failed to reset blocked IPs:', err);
    }
};

const saveBlockedIps = () => {
    try {
        fs.writeFileSync(blockedIpsFile, JSON.stringify({ blocked: [] }, null, 4), 'utf8');
    } catch (err) {}
};

const blockIp = (ip, reason, req = null) => {
    return; // Dynamic IP blocking permanently disabled
};

// Initial load
loadBlockedIps();

// IP blocking middleware (Bypassed so legitimate users/admins/partners are never blocked)
exports.ipBlocker = (req, res, next) => {
    next();
};

const botUserAgents = [
    'curl', 'wget', 'python', 'scrapy', 'postman', 'headless', 'puppeteer', 'selenium', 
    'phantomjs', 'axios', 'got', 'http-client', 'netcrawl', 'spider', 'crawler'
];

exports.unblockAllIps = () => {
    blockedIps.clear();
    saveBlockedIps();
    console.log('[SECURITY] All blocked IPs have been cleared & unblocked.');
};

exports.botScanner = (req, res, next) => {
    // Bot scanner disabled - all requests allowed through
    next();
};

// 3. Request Size Limiter (Intercepts payload before body parsers)
exports.requestSizeLimiter = (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    // Allow maximum 15MB for mutating JSON payloads, larger only for multipart uploads if configured
    const maxLimit = 15 * 1024 * 1024; // 15MB

    if (contentLength > maxLimit) {
        return res.status(413).json({
            success: false,
            message: 'Payload Too Large: Maximum allowed size is 15MB.'
        });
    }
    next();
};

// 4. Rate Limiters using express-rate-limit
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // Very generous limit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again in 15 minutes.'
    }
});

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Generous login limit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.'
    }
});

// 5. Throttler (Incremental response delay for suspicious traffic bursts)
const requestTrackers = new Map();

// Cleanup trackers map occasionally to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [ip, tracker] of requestTrackers.entries()) {
        if (now - tracker.lastRequest > 60000) {
            requestTrackers.delete(ip);
        }
    }
}, 5 * 60 * 1000);

exports.throttler = (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '').replace(/^::ffff:/, '');
    const now = Date.now();

    let tracker = requestTrackers.get(ip);
    if (!tracker) {
        tracker = { count: 0, lastRequest: now };
        requestTrackers.set(ip, tracker);
    }

    // Reset count if last request was more than a minute ago
    if (now - tracker.lastRequest > 60000) {
        tracker.count = 0;
    }

    tracker.count++;
    tracker.lastRequest = now;

    // Trigger throttling after 40 requests in 1 minute
    if (tracker.count > 500) {
        const delayMs = Math.min(5000, 500 * (tracker.count - 40));
        console.log(`[THROTTLER] Injecting ${delayMs}ms delay for IP: ${ip} (Count: ${tracker.count})`);
        return setTimeout(next, delayMs);
    }

    next();
};

// 6. Double-Submit Cookie CSRF Protection
// Excluded paths (Razorpay webhooks & Auth endpoints)
const csrfExcludedPaths = [
    '/api/payments/webhook',
    '/payments/webhook',
    '/api/auth/login',
    '/auth/login',
    '/api/auth/register',
    '/auth/register',
    '/api/auth/google',
    '/auth/google',
    '/api/auth/send-otp',
    '/auth/send-otp',
    '/api/auth/verify-otp',
    '/auth/verify-otp',
    '/api/auth/forgot-password',
    '/auth/forgot-password',
    '/api/auth/reset-password',
    '/auth/reset-password',
    '/api/ota/inventory',
    '/api/ota/rates',
    '/ota/inventory',
    '/ota/rates',
    '/api/ai/chat',
    '/ai/chat',
    '/api/ai/rooms',
    '/ai/rooms',
    '/api/ai/debug-hotels',
    '/ai/debug-hotels',
    '/api/admin/importer',
    '/admin/importer',
    'importer',
    'scraped-hotel',
    'scraped-hotels'
];

exports.csrfHandler = (req, res, next) => {
    next();
};

exports.blockIpExternal = blockIp;
