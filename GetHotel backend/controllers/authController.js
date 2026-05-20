const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/emailService');

// OTP Memory Cache
global.otpCache = global.otpCache || new Map();
global.changePasswordCache = global.changePasswordCache || new Map();
global.changeEmailCache = global.changeEmailCache || new Map();

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

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

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

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash password now to store safely in memory
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save in global memory cache (expires in 10 minutes)
        global.otpCache.set(email, {
            name,
            email,
            passwordHash: hashedPassword,
            role: role || 'user',
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
        });

        // Send OTP via email
        await sendOtpEmail(email, name, otp);

        res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
};

// @desc    Verify OTP and Create User
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    try {
        const cachedData = global.otpCache.get(email);

        if (!cachedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not requested. Please try again.' });
        }

        if (cachedData.expiresAt < Date.now()) {
            global.otpCache.delete(email);
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (cachedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        // Create user in database
        const user = await prisma.user.create({
            data: {
                name: cachedData.name,
                email: cachedData.email,
                password: cachedData.passwordHash,
                role: cachedData.role,
                updatedAt: new Date()
            },
        });

        // Clear OTP from cache
        global.otpCache.delete(email);

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
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

// @desc    Send OTP for changing password
// @route   POST /api/auth/change-password/send-otp
// @access  Private
exports.sendChangePasswordOTP = async (req, res, next) => {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'New password and confirm password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Save in global memory cache (expires in 10 minutes)
        global.changePasswordCache.set(req.user.email, {
            userId: req.user.id,
            passwordHash: hashedPassword,
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
        });

        // Send OTP via email using registered email
        await sendOtpEmail(req.user.email, req.user.name, otp);

        res.status(200).json({ success: true, message: 'OTP sent to your registered email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
};

// @desc    Verify OTP and change password
// @route   POST /api/auth/change-password/verify-otp
// @access  Private
exports.verifyChangePasswordOTP = async (req, res, next) => {
    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    try {
        const cachedData = global.changePasswordCache.get(req.user.email);

        if (!cachedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not requested. Please try again.' });
        }

        if (cachedData.expiresAt < Date.now()) {
            global.changePasswordCache.delete(req.user.email);
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (cachedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        // Retrieve existing history
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        let history = [];
        if (user && user.passwordChangeHistory) {
            try {
                history = JSON.parse(user.passwordChangeHistory);
                if (!Array.isArray(history)) history = [];
            } catch (e) {
                history = [];
            }
        }
        history.push(new Date().toISOString());

        // Update password & history in database
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                password: cachedData.passwordHash,
                passwordLastChangedAt: new Date(),
                passwordChangeHistory: JSON.stringify(history),
                updatedAt: new Date()
            }
        });

        // Clear OTP from cache
        global.changePasswordCache.delete(req.user.email);

        res.status(200).json({ 
            success: true, 
            message: 'Password updated successfully!',
            data: {
                passwordLastChangedAt: updatedUser.passwordLastChangedAt,
                passwordChangeHistory: updatedUser.passwordChangeHistory
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Password update failed. Please try again.' });
    }
};

// @desc    Send OTP for changing email
// @route   POST /api/auth/change-email/send-otp
// @access  Private
exports.sendChangeEmailOTP = async (req, res, next) => {
    const { newEmail } = req.body;

    if (!newEmail) {
        return res.status(400).json({ success: false, message: 'New email is required' });
    }

    try {
        // 1. Check if the new email is already registered
        const existingUser = await prisma.user.findUnique({
            where: { email: newEmail }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'This email is already registered to another account.' });
        }

        // 2. Retrieve existing user and verify change limits
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let history = [];
        if (user.emailChangeHistory) {
            try {
                history = JSON.parse(user.emailChangeHistory);
                if (!Array.isArray(history)) history = [];
            } catch (e) {
                history = [];
            }
        }

        // Filter history to current calendar year
        const currentYear = new Date().getFullYear();
        const changesThisYear = history.filter(dateStr => new Date(dateStr).getFullYear() === currentYear);

        if (changesThisYear.length >= 2) {
            return res.status(400).json({
                success: false,
                message: 'You can only change your registered email at most 2 times per calendar year.'
            });
        }

        // 3. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Save to global memory cache
        global.changeEmailCache = global.changeEmailCache || new Map();
        global.changeEmailCache.set(req.user.email, {
            newEmail,
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // 5. Send OTP email to the NEW email address (so we verify they own it!)
        await sendOtpEmail(newEmail, user.name, otp);

        res.status(200).json({ success: true, message: 'OTP sent to your new email address.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
};

// @desc    Verify OTP and change email
// @route   POST /api/auth/change-email/verify-otp
// @access  Private
exports.verifyChangeEmailOTP = async (req, res, next) => {
    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    try {
        global.changeEmailCache = global.changeEmailCache || new Map();
        const cachedData = global.changeEmailCache.get(req.user.email);

        if (!cachedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not requested. Please try again.' });
        }

        if (cachedData.expiresAt < Date.now()) {
            global.changeEmailCache.delete(req.user.email);
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (cachedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        // Retrieve existing history
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let history = [];
        if (user.emailChangeHistory) {
            try {
                history = JSON.parse(user.emailChangeHistory);
                if (!Array.isArray(history)) history = [];
            } catch (e) {
                history = [];
            }
        }
        history.push(new Date().toISOString());

        // Update email and history in database
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                email: cachedData.newEmail,
                emailChangeHistory: JSON.stringify(history),
                updatedAt: new Date()
            }
        });

        // Clear OTP from cache
        global.changeEmailCache.delete(req.user.email);

        res.status(200).json({
            success: true,
            message: 'Email updated successfully!',
            data: {
                email: updatedUser.email,
                emailChangeHistory: updatedUser.emailChangeHistory
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Email update failed. Please try again.' });
    }
};
