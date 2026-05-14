const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'This email is already registered. Please login instead.' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'user',
                updatedAt: new Date()
            },
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password, userpassword, partnerpassword, controlpassword } = req.body;
    
    // Support multiple naming conventions for different portals
    const actualPassword = password || userpassword || partnerpassword || controlpassword;

    if (!email || !actualPassword) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    try {
        // Check for user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(actualPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 3. Check for Rejected Partner Request
        const rejectedRequest = await prisma.partnerrequest.findFirst({
            where: {
                userEmail: email,
                status: 'rejected'
            }
        });

        if (rejectedRequest) {
            return res.status(403).json({ 
                success: false, 
                message: 'Your partner application was rejected. This account is permanently disabled.' 
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Create token and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.status(statusCode).json({
        success: true,
        token,
    });
};

const admin = require('../config/firebase');

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'Please provide an ID token' });
    }

    try {
        // VERIFY ID TOKEN WITH FIREBASE ADMIN SDK
        // This is the most secure way to verify the token is legitimate
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        if (!decodedToken || !decodedToken.email) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Firebase token' });
        }

        const email = decodedToken.email;

        // Check if user exists in our MySQL database
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Create NEW USER with default 'user' role
            user = await prisma.user.create({
                data: {
                    name: decodedToken.name || email.split('@')[0],
                    email: email,
                    password: await bcrypt.hash(Math.random().toString(36).slice(-15), 10), // Random complex password
                    role: 'user', // Default role for this route
                    updatedAt: new Date()
                },
            });
            console.log(`[SECURITY] New user created via Google: ${email}`);
        } else {
            console.log(`[SECURITY] Existing user logged in via Google: ${email}`);
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(`[AUTH ERROR] Google login failed: ${err.message}`);
        res.status(401).json({ success: false, message: 'Authentication failed. Please try again.' });
    }
};

// @desc    Get current logged in user
// @route   POST /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                hotel: true
            }
        });

        // Also fetch the latest partner request status
        const partnerRequest = await prisma.partnerrequest.findFirst({
            where: { userEmail: user.email },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: {
                ...user,
                partnerRequestStatus: partnerRequest?.status || null
            },
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Impersonate user
// @route   POST /api/auth/impersonate/:id
// @access  Private (Super Admin)
exports.impersonate = async (req, res, next) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
