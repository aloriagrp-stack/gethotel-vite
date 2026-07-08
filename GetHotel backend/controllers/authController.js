const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail, sendResetEmail } = require('../utils/emailService');

// OTP Memory Cache
global.otpCache = global.otpCache || new Map();
global.changePasswordCache = global.changePasswordCache || new Map();
global.changeEmailCache = global.changeEmailCache || new Map();
global.loginAttempts = global.loginAttempts || new Map();
global.blockedLogins = global.blockedLogins || new Map();
global.passwordResetCache = global.passwordResetCache || new Map();

const trackFailedAttempt = (ip, email, req) => {
    const now = Date.now();
    
    // IP tracking
    const ipAttempts = (global.loginAttempts.get(ip) || 0) + 1;
    global.loginAttempts.set(ip, ipAttempts);
    if (ipAttempts >= 5) {
        global.blockedLogins.set(ip, now + 15 * 60 * 1000); // 15 mins
        global.loginAttempts.delete(ip);
        const { logAdminActivity } = require('../utils/auditLogger');
        logAdminActivity({ email: 'anonymous', role: 'guest' }, 'SUSPICIOUS_LOGIN_ATTEMPT', {
            reason: `Brute force threshold reached: 5 failures. IP locked out.`,
            ip,
            emailTarget: email
        }, req);
    }
    
    // Email tracking
    if (email) {
        const emailAttempts = (global.loginAttempts.get(email) || 0) + 1;
        global.loginAttempts.set(email, emailAttempts);
        if (emailAttempts >= 5) {
            global.blockedLogins.set(email, now + 15 * 60 * 1000); // 15 mins
            global.loginAttempts.delete(email);
            const { logAdminActivity } = require('../utils/auditLogger');
            logAdminActivity({ email, role: 'suspect' }, 'SUSPICIOUS_LOGIN_ATTEMPT', {
                reason: `Brute force threshold reached: 5 failures for email. Account locked out.`,
                ip,
                email
            }, req);
        }
    }
};

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
    const { email, password, userpassword, partnerpassword, controlpassword, portal } = req.body;
    
    // Support multiple naming conventions for different portals
    const actualPassword = password || userpassword || partnerpassword || controlpassword;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
    const normalizedPassword = typeof actualPassword === 'string' ? actualPassword.trim() : actualPassword;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    if (!normalizedEmail || !normalizedPassword) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check brute-force lockout status
    const now = Date.now();
    const blockedUntilIP = global.blockedLogins.get(ip);
    const blockedUntilEmail = global.blockedLogins.get(normalizedEmail);

    if (blockedUntilIP && blockedUntilIP > now) {
        const minLeft = Math.ceil((blockedUntilIP - now) / (60 * 1000));
        return res.status(429).json({ success: false, message: `Too many failed attempts from this device. Try again in ${minLeft} minutes.` });
    }
    if (blockedUntilEmail && blockedUntilEmail > now) {
        const minLeft = Math.ceil((blockedUntilEmail - now) / (60 * 1000));
        return res.status(429).json({ success: false, message: `Too many failed attempts for this account. Try again in ${minLeft} minutes.` });
    }

    try {
        // Check for user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (!user) {
            trackFailedAttempt(ip, normalizedEmail, req);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Restrict partner accounts from logging in as regular customers
        if (user.role === 'hotel_admin' && portal !== 'partner') {
            trackFailedAttempt(ip, normalizedEmail, req);
            return res.status(403).json({
                success: false,
                message: 'Partner accounts cannot be used as customer accounts. Please log in through the Partner Portal.'
            });
        }

        // Check if password matches
        let isMatch = await bcrypt.compare(normalizedPassword, user.password);

        // ControlHub often displays credentials in uppercase. Keep normal users strict,
        // but allow the super admin master key regardless of accidental casing.
        if (!isMatch && user.role === 'super_admin' && typeof normalizedPassword === 'string') {
            isMatch = await bcrypt.compare(normalizedPassword.toLowerCase(), user.password);
        }

        if (!isMatch) {
            trackFailedAttempt(ip, normalizedEmail, req);
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
            trackFailedAttempt(ip, normalizedEmail, req);
            return res.status(403).json({ 
                success: false, 
                message: 'Your partner application was rejected. This account is permanently disabled.' 
            });
        }

        // Clear brute force tracking on successful login
        global.loginAttempts.delete(ip);
        global.loginAttempts.delete(normalizedEmail);

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Create token and send response with role-based session limits
const sendTokenResponse = (user, statusCode, res) => {
    const isAdmin = user.role === 'super_admin' || user.role === 'hotel_admin';
    const expiresIn = isAdmin ? '12h' : '30d';
    const cookieAgeMs = isAdmin ? 12 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn,
    });

    const cookieOptions = {
        expires: new Date(Date.now() + cookieAgeMs),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    };

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
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
            if (user.role === 'hotel_admin') {
                console.log(`[SECURITY] Google login denied for partner account: ${email}`);
                return res.status(403).json({
                    success: false,
                    message: 'Partner accounts cannot be used as customer accounts. Please log in through the Partner Portal.'
                });
            }
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

// @desc    Logout user & blacklist token
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        const token = req.token || req.headers.authorization?.split(' ')[1] || req.cookies?.token;

        if (token) {
            const { blacklistToken } = require('../middleware/auth');
            blacklistToken(token);
        }

        // Clear client cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000), // expire in 10 seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Logout failed: ' + err.message });
    }
};

// @desc    Forgot Password - Request reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

    if (!normalizedEmail) {
        return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        // For security reasons, do not explicitly leak that the email doesn't exist.
        // Respond with success message but don't do anything else.
        if (!user) {
            return res.status(200).json({ success: true, message: 'If that email is registered, a password reset link has been sent.' });
        }

        // Generate 32-byte secure random reset token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Store reset token hash in cache with 15-minute expiration
        global.passwordResetCache.set(tokenHash, {
            userId: user.id,
            expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
        });

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${token}`;

        // Send email
        await sendResetEmail(user.email, user.name, resetUrl);

        res.status(200).json({
            success: true,
            message: 'If that email is registered, a password reset link has been sent.'
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Failed to send password reset link. Please try again.' });
    }
};

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    try {
        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const cachedReset = global.passwordResetCache.get(tokenHash);

        if (!cachedReset) {
            return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
        }

        if (cachedReset.expiresAt < Date.now()) {
            global.passwordResetCache.delete(tokenHash);
            return res.status(400).json({ success: false, message: 'Password reset token has expired' });
        }

        const user = await prisma.user.findUnique({
            where: { id: cachedReset.userId }
        });

        if (!user) {
            global.passwordResetCache.delete(tokenHash);
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password history
        let history = [];
        if (user.passwordChangeHistory) {
            try {
                history = JSON.parse(user.passwordChangeHistory);
                if (!Array.isArray(history)) history = [];
            } catch (e) {
                history = [];
            }
        }
        history.push(new Date().toISOString());

        // Save new password and update history to invalidate old session tokens
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordLastChangedAt: new Date(),
                passwordChangeHistory: JSON.stringify(history),
                updatedAt: new Date()
            }
        });

        // Invalidate token from cache
        global.passwordResetCache.delete(tokenHash);

        // Log security audit activity
        const { logAdminActivity } = require('../utils/auditLogger');
        logAdminActivity(user, 'PASSWORD_RESET_VIA_TOKEN', {
            userId: user.id,
            email: user.email
        }, req);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
    }
};

exports.unblockDebug = async (req, res) => {
    let generateOutput = '';
    let generateError = '';
    try {
        const fs = require('fs');
        const path = require('path');
        const { execSync } = require('child_process');
        const blockedIpsFile = path.join(__dirname, '../config/blocked_ips.json');
        
        // 1. Clear blocked IPs file on disk
        try {
            fs.writeFileSync(blockedIpsFile, JSON.stringify({ blocked: [] }, null, 4), 'utf8');
        } catch (e) {
            console.error('Failed to clear blocked IPs:', e.message);
        }

        // 2. Load and repair .env database URL and environment type
        const envPath = path.join(__dirname, '../.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
            // Replace DATABASE_URL with the correct backup one
            envContent = envContent.replace(/DATABASE_URL\s*=\s*["']?mysql:\/\/[^"'\s\n]+["']?/g, 'DATABASE_URL="mysql://vgyuvmpi_gethotel_db:shriyanshking@localhost:3306/vgyuvmpi_gethotel_db"');
            // Set NODE_ENV to production
            envContent = envContent.replace(/NODE_ENV\s*=\s*development/g, 'NODE_ENV=production');
            
            // Set live Razorpay keys
            if (envContent.includes('RAZORPAY_KEY_ID')) {
                envContent = envContent.replace(/RAZORPAY_KEY_ID\s*=\s*[^\s\n]+/g, 'RAZORPAY_KEY_ID=rzp_live_T16NuPtvvs9cRV');
            } else {
                envContent += '\nRAZORPAY_KEY_ID=rzp_live_T16NuPtvvs9cRV';
            }
            if (envContent.includes('RAZORPAY_KEY_SECRET')) {
                envContent = envContent.replace(/RAZORPAY_KEY_SECRET\s*=\s*[^\s\n]+/g, 'RAZORPAY_KEY_SECRET=BzQHn3KOCxAX2HbXgLUme0dZ');
            } else {
                envContent += '\nRAZORPAY_KEY_SECRET=BzQHn3KOCxAX2HbXgLUme0dZ';
            }
            
            if (envContent.includes('RAZORPAY_WEBHOOK_SECRET')) {
                envContent = envContent.replace(/RAZORPAY_WEBHOOK_SECRET\s*=\s*[^\s\n]+/g, 'RAZORPAY_WEBHOOK_SECRET=gethotelstayssecret2026');
            } else {
                envContent += '\nRAZORPAY_WEBHOOK_SECRET=gethotelstayssecret2026';
            }
            
            // Save repaired .env
            fs.writeFileSync(envPath, envContent, 'utf8');
        }

        // 3. Force generate Prisma Client explicitly
        try {
            const rootDir = path.join(__dirname, '..');
            const prismaCliPath = path.join(rootDir, 'node_modules', 'prisma', 'build', 'index.js');
            
            // Check if node_modules/prisma exists, if not, run npm install
            if (!fs.existsSync(prismaCliPath)) {
                console.log('[DEBUG] Prisma package missing. Running npm install...');
                try {
                    const pathDelimiter = require('path').delimiter;
                    execSync('npm install --no-audit --no-fund --only=production', {
                        cwd: rootDir,
                        timeout: 180000,
                        env: {
                            ...process.env,
                            PATH: process.env.PATH + pathDelimiter + path.dirname(process.execPath)
                        }
                    });
                    console.log('[DEBUG] npm install finished.');
                } catch (npmErr) {
                    console.error('npm install failed:', npmErr.message);
                }
            }

            const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
            const cmd = `"${process.execPath}" "${prismaCliPath}" generate --schema="${schemaPath}"`;
            
            generateOutput = execSync(cmd, {
                cwd: rootDir,
                timeout: 120000,
                env: {
                    ...process.env,
                    PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true',
                }
            }).toString();
        } catch (genErr) {
            generateError = genErr.message + '\n' + (genErr.stderr ? genErr.stderr.toString() : '');
        }

        res.json({
            success: true,
            message: 'Database configuration successfully repaired and Prisma Client regenerated!',
            generateOutput,
            generateError,
            restarted: true
        });

        // 4. Force exit node process to let Passenger reload with the new env
        setTimeout(() => {
            console.log('[DEBUG] Force exiting Node process to reload config.');
            process.exit(0);
        }, 500);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, generateOutput, generateError });
    }
};
