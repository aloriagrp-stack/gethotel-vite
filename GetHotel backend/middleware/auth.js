const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// In-memory blacklist for revoked JWT tokens (e.g. after logout)
const revokedTokens = new Set();

// Clean up expired tokens periodically (every 1 hour)
setInterval(() => {
    revokedTokens.clear();
}, 60 * 60 * 1000);

exports.blacklistToken = (token) => {
    if (token && typeof token === 'string') {
        revokedTokens.add(token);
    }
};

exports.isTokenBlacklisted = (token) => {
    return Boolean(token && revokedTokens.has(token));
};

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token || token === 'none') {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    if (revokedTokens.has(token)) {
        return res.status(401).json({ success: false, message: 'Token has been revoked. Please log in again.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User account no longer exists' });
        }

        req.token = token;
        next();
    } catch (err) {
        console.error('[AUTH ERROR]:', err.message);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Optional Auth middleware — attaches req.user if token is valid, but does not block guests
exports.optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token || token === 'none' || revokedTokens.has(token)) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        req.token = token;
    } catch {
        req.user = null;
    }
    next();
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user ? req.user.role : 'unauthenticated'} is not authorized to access this route`,
            });
        }
        next();
    };
};

