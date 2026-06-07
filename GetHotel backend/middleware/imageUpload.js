const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Lazy-load sharp to ensure server still starts even if sharp binaries have issues
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error('[WebP Middleware Warning]: Failed to load sharp. Fallback raw file saving will be used.', e.message);
}

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Converts a base64 image data URL into a WebP file on disk and returns the relative path.
 * If sharp is unavailable or fails, it falls back to writing the raw image in its original format.
 */
async function processBase64Image(base64Str) {
    try {
        const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (!matches) {
            return base64Str; // Not a base64 data URL
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate a stable and unique filename using a hash of the image content + timestamp
        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
        const filename = `img_${Date.now()}_${hash}.webp`;
        const filePath = path.join(UPLOADS_DIR, filename);

        if (sharp) {
            // Convert to high-quality compressed WebP
            await sharp(buffer)
                .webp({ quality: 80 })
                .toFile(filePath);
            return `/uploads/${filename}`;
        } else {
            throw new Error('Sharp library is not loaded');
        }
    } catch (error) {
        console.warn('[WebP Conversion Failed, using fallback]:', error.message);
        
        // Fallback: Write raw file in original format to prevent database bloating
        try {
            const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches) {
                const mimeType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                const ext = mimeType.split('/')[1] || 'png';
                const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
                const filename = `img_${Date.now()}_${hash}.${ext}`;
                const filePath = path.join(UPLOADS_DIR, filename);
                fs.writeFileSync(filePath, buffer);
                return `/uploads/${filename}`;
            }
        } catch (fallbackErr) {
            console.error('[WebP Fallback Saving Failed]:', fallbackErr.message);
        }
        return base64Str; // Last resort: return base64 as-is
    }
}

/**
 * Recursively scans and transforms base64 data URLs inside any object or array.
 * Supports parsing and updating JSON-stringified arrays and objects.
 */
async function recursiveProcessBase64(obj) {
    if (typeof obj === 'string') {
        if (obj.startsWith('data:image/')) {
            return await processBase64Image(obj);
        }
        // Handle JSON stringified arrays or objects (common in hotel/room image uploads)
        if (obj.startsWith('[') || obj.startsWith('{')) {
            try {
                const parsed = JSON.parse(obj);
                const processed = await recursiveProcessBase64(parsed);
                return JSON.stringify(processed);
            } catch (e) {
                return obj;
            }
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        const processedArray = [];
        for (const item of obj) {
            processedArray.push(await recursiveProcessBase64(item));
        }
        return processedArray;
    }
    if (obj instanceof Date) {
        return obj;
    }
    if (obj !== null && typeof obj === 'object') {
        const processedObj = {};
        for (const key of Object.keys(obj)) {
            processedObj[key] = await recursiveProcessBase64(obj[key]);
        }
        return processedObj;
    }
    return obj;
}

/**
 * Recursively scans and transforms relative paths starting with '/uploads/' to absolute URLs.
 * Supports parsing and updating JSON-stringified arrays and objects.
 */
function recursiveResolveUrls(obj, baseUrl) {
    if (typeof obj === 'string') {
        if (obj.startsWith('/uploads/')) {
            return `${baseUrl}${obj}`;
        }
        // Handle JSON stringified arrays or objects
        if (obj.startsWith('[') || obj.startsWith('{')) {
            try {
                const parsed = JSON.parse(obj);
                const processed = recursiveResolveUrls(parsed, baseUrl);
                return JSON.stringify(processed);
            } catch (e) {
                return obj;
            }
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => recursiveResolveUrls(item, baseUrl));
    }
    if (obj instanceof Date) {
        return obj;
    }
    if (obj !== null && typeof obj === 'object') {
        const resolvedObj = {};
        for (const key of Object.keys(obj)) {
            resolvedObj[key] = recursiveResolveUrls(obj[key], baseUrl);
        }
        return resolvedObj;
    }
    return obj;
}


/**
 * Middleware to intercept incoming POST/PUT/PATCH write requests and process uploaded base64 images.
 */
const requestImageProcessor = async (req, res, next) => {
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        try {
            req.body = await recursiveProcessBase64(req.body);
        } catch (err) {
            console.error('[Request Image Processor Error]:', err.message);
        }
    }
    next();
};

/**
 * Middleware to intercept outgoing API responses and map relative upload paths to absolute URLs.
 */
const responseImageResolver = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        if (body && typeof body === 'object') {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            const hasApi = req.originalUrl && req.originalUrl.startsWith('/api');
            const baseUrl = `${protocol}://${host}${hasApi ? '/api' : ''}`;
            try {
                body = recursiveResolveUrls(body, baseUrl);
            } catch (err) {
                console.error('[Response URL Resolver Error]:', err.message);
            }
        }
        return originalJson.call(this, body);
    };
    next();
};

module.exports = {
    requestImageProcessor,
    responseImageResolver,
    recursiveProcessBase64
};
