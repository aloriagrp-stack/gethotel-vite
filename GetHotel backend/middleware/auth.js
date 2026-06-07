const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const admin = require('../config/firebase');

// Global memory cache for blacklisted tokens (with self-cleaning mechanism)
global.tokenBlacklist = global.tokenBlacklist || new Map();

// Periodic cleanup of expired blacklisted tokens to prevent memory leaks (every 1 hour)
if (!global.blacklistCleanupInterval) {
    global.blacklistCleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [token, expiresAt] of global.tokenBlacklist.entries()) {
            if (expiresAt < now) {
                global.tokenBlacklist.delete(token);
            }
        }
        console.log(`[SECURITY] Cleaned up expired tokens from blacklist cache at ${new Date().toISOString()}`);
    }, 60 * 60 * 1000); // 1 hour
    
    // Allow Node.js to exit if this is the only active handle
    global.blacklistCleanupInterval.unref();
}

/**
 * Log suspicious access attempts with requester IP, requested URL, and reasons.
 */
const logSuspiciousAccess = (req, reason, details = {}) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const url = req.originalUrl || req.url;
    const method = req.method;
    const timestamp = new Date().toISOString();
    console.warn(
        `[SECURITY WARNING] [${timestamp}] Suspicious access from IP: ${ip} | Method: ${method} | URL: ${url} | Reason: ${reason} | Details: ${JSON.stringify(details)}`
    );
};

/**
 * Blacklist a token upon logout.
 */
exports.blacklistToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
            // exp is in seconds, convert to ms
            const expiresAt = decoded.exp * 1000;
            if (expiresAt > Date.now()) {
                global.tokenBlacklist.set(token, expiresAt);
            }
        } else {
            // Default fallback: blacklist for 30 days
            global.tokenBlacklist.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    } catch (err) {
        global.tokenBlacklist.set(token, Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
};

/**
 * Check if a token has been blacklisted.
 */
const isTokenBlacklisted = (token) => {
    const expiresAt = global.tokenBlacklist.get(token);
    if (!expiresAt) return false;
    if (expiresAt < Date.now()) {
        global.tokenBlacklist.delete(token);
        return false;
    }
    return true;
};

/**
 * Middleware to protect routes and verify JWT / Firebase ID tokens.
 */
exports.protect = async (req, res, next) => {
    let token;

    // 1. Extract token from Authorization header or secure HTTP-only cookies
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // 2. Reject if no token is found
    if (!token) {
        logSuspiciousAccess(req, 'No authentication token provided');
        return res.status(401).json({ success: false, message: 'Not authorized: Access token missing' });
    }

    // 3. Reject if the token is blacklisted (logout invalidation)
    if (isTokenBlacklisted(token)) {
        logSuspiciousAccess(req, 'Attempted access with blacklisted/logged-out token');
        return res.status(401).json({ success: false, message: 'Session invalidated: Please log in again' });
    }

    try {
        let decoded = null;
        let isFirebase = false;

        // 4. Try verifying as Firebase ID Token first (if it looks like one)
        // Firebase tokens are usually much longer and don't match our local signing key structure
        if (token.length > 500) {
            try {
                decoded = await admin.auth().verifyIdToken(token);
                isFirebase = true;
            } catch (firebaseErr) {
                // If it fails but is long, fall back to standard JWT or raise a verification error
                console.log('[AUTH] Firebase token verification failed, falling back to local JWT verification.');
            }
        }

        // 5. If not verified by Firebase, verify using local secret
        if (!decoded) {
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (jwtErr) {
                if (jwtErr.name === 'TokenExpiredError') {
                    logSuspiciousAccess(req, 'Expired token presented', { expiredAt: jwtErr.expiredAt });
                    return res.status(401).json({ success: false, message: 'Session expired: Please log in again' });
                }
                throw jwtErr; // Pass other JWT errors to catch block
            }
        }

        // 6. Fetch user from database
        let user;
        if (isFirebase) {
            if (!decoded.email) {
                logSuspiciousAccess(req, 'Firebase token payload missing email attribute');
                return res.status(401).json({ success: false, message: 'Not authorized: Invalid token payload' });
            }
            user = await prisma.user.findUnique({
                where: { email: decoded.email }
            });
        } else {
            user = await prisma.user.findUnique({
                where: { id: decoded.id }
            });
        }

        // 7. Verify user exists and is currently active
        if (!user) {
            logSuspiciousAccess(req, 'Token claims user that does not exist in database', { email: decoded.email, id: decoded.id });
            return res.status(401).json({ success: false, message: 'Not authorized: User account no longer exists' });
        }

        if (user.isActive === false) {
            logSuspiciousAccess(req, 'Suspended/Inactive user attempted access', { email: user.email });
            return res.status(403).json({ success: false, message: 'Access Denied: This account has been suspended' });
        }

        // 8. Replay Attack & Password Change Check (Local JWT only)
        // If password was changed after the token issue date, invalidate the token.
        if (!isFirebase && user.passwordLastChangedAt && decoded.iat) {
            const lastChangedTime = new Date(user.passwordLastChangedAt).getTime();
            const tokenIssuedTime = decoded.iat * 1000;
            // Allow 1 second clock drift skew
            if (lastChangedTime > tokenIssuedTime + 1000) {
                logSuspiciousAccess(req, 'Token replay attempt: Token issued before last password change', { email: user.email });
                return res.status(401).json({ success: false, message: 'Session invalidated: Password recently changed. Please log in again' });
            }
        }

        // 9. Assign user to request object
        req.user = user;
        req.token = token; // Store token for logout blacklisting
        next();
    } catch (err) {
        logSuspiciousAccess(req, 'Malformed or signature-invalid token presented', { error: err.message });
        return res.status(401).json({ success: false, message: 'Not authorized: Token validation failed' });
    }
};

/**
 * Middleware to authorize specific roles.
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            logSuspiciousAccess(req, 'Unauthorized role access attempt', { requiredRoles: roles, userRole: req.user.role });
            return res.status(403).json({
                success: false,
                message: `Forbidden: Role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
