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
        if (!fs.existsSync(blockedIpsFile)) {
            fs.writeFileSync(blockedIpsFile, JSON.stringify({ blocked: [] }, null, 4), 'utf8');
        }
        const data = JSON.parse(fs.readFileSync(blockedIpsFile, 'utf8'));
        blockedIps = new Set(data.blocked || []);
        console.log(`[SECURITY] Loaded ${blockedIps.size} blocked IPs.`);
    } catch (err) {
        console.error('[SECURITY ERROR] Failed to load blocked IPs:', err);
    }
};

const saveBlockedIps = () => {
    try {
        fs.writeFileSync(blockedIpsFile, JSON.stringify({ blocked: Array.from(blockedIps) }, null, 4), 'utf8');
    } catch (err) {
        console.error('[SECURITY ERROR] Failed to save blocked IPs:', err);
    }
};

const blockIp = (ip, reason, req = null) => {
    if (!ip) return;
    // Normalize IP
    const cleanIp = ip.replace(/^::ffff:/, '');
    if (blockedIps.has(cleanIp)) return;

    blockedIps.add(cleanIp);
    saveBlockedIps();
    console.warn(`[SECURITY LOCKOUT] Blocked IP: ${cleanIp} | Reason: ${reason}`);

    if (req) {
        logAdminActivity({ email: 'system', role: 'security' }, 'IP_BLOCKED_DYNAMIC', {
            blockedIp: cleanIp,
            reason,
            url: req.originalUrl,
            ua: req.headers['user-agent']
        }, req);
    }
};

// Initial load
loadBlockedIps();

// IP blocking middleware
exports.ipBlocker = (req, res, next) => {
    if (req.originalUrl && req.originalUrl.includes('/unblock-debug')) {
        return next();
    }
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '').replace(/^::ffff:/, '');
    if (blockedIps.has(ip)) {
        return res.status(403).json({
            success: false,
            message: 'Access Denied: Your IP has been blocked due to suspicious activity.'
        });
    }
    next();
};

// 2. User-Agent Bot and Header Scanner
const botUserAgents = [
    'curl', 'wget', 'python', 'scrapy', 'postman', 'headless', 'puppeteer', 'selenium', 
    'phantomjs', 'axios', 'got', 'http-client', 'netcrawl', 'spider', 'crawler'
];

exports.botScanner = (req, res, next) => {
    // Bypass bot scanner for all public OTA endpoints, importer, and debug routes
    const urlStr = (req.originalUrl || req.url || '').toLowerCase();
    if (urlStr.includes('/api/ota') || urlStr.includes('/ota') || urlStr.includes('/unblock-debug') || urlStr.includes('importer') || urlStr.includes('scraped-hotel')) {
        return next();
    }

    const userAgent = req.headers['user-agent'] || '';
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '').replace(/^::ffff:/, '');

    // Allow internal or empty user agents if strictly required, but flag common bot footprints
    const isBot = botUserAgents.some(bot => userAgent.toLowerCase().includes(bot));
    
    // Exception for development test curls if needed, but in production we block
    if (isBot && process.env.NODE_ENV === 'production') {
        blockIp(ip, `Suspicious bot user-agent: "${userAgent}"`, req);
        return res.status(403).json({
            success: false,
            message: 'Access Denied: Automated requests are prohibited.'
        });
    }
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
    max: 200, // Limit each IP to 200 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again in 15 minutes.'
    }
});

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login/register requests per window
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
    if (tracker.count > 40) {
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
    // 0. Immediate bypass for importer & scraped-hotel endpoints
    const urlStr = (req.originalUrl || req.url || '').toLowerCase();
    if (urlStr.includes('importer') || urlStr.includes('scraped-hotel') || urlStr.includes('scraped-hotels')) {
        return next();
    }

    // Generate and set CSRF cookie if it doesn't exist
    let csrfToken = req.cookies?.['csrf-token'];
    if (!csrfToken) {
        csrfToken = crypto.randomBytes(24).toString('hex');
        res.cookie('csrf-token', csrfToken, {
            httpOnly: false, // Must be readable by client script to send in headers
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
    }

    // Verify token for state-mutating requests
    const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (mutatingMethods.includes(req.method)) {
        // Skip check if path is in exclusions
        const urlStr = (req.originalUrl || req.url || '').toLowerCase();
        const isExcluded = csrfExcludedPaths.some(excludedPath => urlStr.includes(excludedPath.toLowerCase()));
        if (isExcluded) {
            return next();
        }

        // Bypass CSRF for same-origin/localhost/network requests
        const origin = (req.headers.origin || req.headers.referer || '').trim().toLowerCase();
        const isSameOrigin = origin.includes('gethotelstays.com') || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('http://192.168.');
        if (isSameOrigin) {
            return next();
        }

        const headerToken = req.headers['x-csrf-token'];
        if (!headerToken || headerToken !== csrfToken) {
            console.warn(`[CSRF FAILURE] IP: ${req.ip} | Header: ${headerToken} | Cookie: ${csrfToken}`);
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Invalid or missing CSRF token.'
            });
        }
    }

    next();
};

exports.blockIpExternal = blockIp;
