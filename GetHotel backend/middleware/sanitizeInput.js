/**
 * Centralized Input Sanitization & Anti-Hacker Middleware
 * Protects against XSS, Parameter Pollution, and Prisma query object manipulation.
 */

// Helper to escape potentially dangerous HTML characters
const escapeHtmlTags = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

// Helper to sanitize parameters recursively
const sanitizeObject = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Protection against excessive nesting depth (support rich hotel schemas up to 15 depth)
    if (depth > 15) {
        throw new Error('Payload nesting depth exceeded maximum limit.');
    }
    
    // Protection against excessive parameter size (support up to 1000 keys for gallery images & rooms)
    if (Object.keys(obj).length > 1000) {
        throw new Error('Payload contains too many parameters.');
    }
    
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Prevent Prototype Pollution
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                delete obj[key];
                continue;
            }
            
            const val = obj[key];
            if (typeof val === 'string') {
                obj[key] = escapeHtmlTags(val.trim());
            } else if (val && typeof val === 'object') {
                obj[key] = sanitizeObject(val, depth + 1);
            }
        }
    }
    return obj;
};

// Main middleware
exports.sanitizeInput = (req, res, next) => {
    try {
        const urlStr = (req.originalUrl || req.url || '').toLowerCase();
        // Bypass deep object sanitization for importer/scraped-hotel endpoints
        if (urlStr.includes('importer') || urlStr.includes('scraped-hotel')) {
            return next();
        }
        if (req.body) sanitizeObject(req.body);
        if (req.query) sanitizeObject(req.query);
        if (req.params) sanitizeObject(req.params);
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Malicious payload detected: ' + err.message
        });
    }
};
