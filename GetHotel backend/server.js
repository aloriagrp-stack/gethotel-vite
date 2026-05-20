const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Diagnostic test routes (Matching both with and without /api)
const testHandler = async (req, res) => {
    let dbStatus = 'Checking...';
    try {
        const prisma = require('./config/db');
        await prisma.$connect();
        dbStatus = 'Connected! ✅';
    } catch (err) {
        dbStatus = `Failed: ${err.message} ❌`;
    }
    
    // Find all registered GET routes to see what is loaded in memory
    const routes = [];
    try {
        app._router.stack.forEach(middleware => {
            if (middleware.route) { // routes registered directly on the app
                routes.push(Object.keys(middleware.route.methods).join(', ').toUpperCase() + ' ' + middleware.route.path);
            }
        });
    } catch (e) {
        routes.push('Error loading routes: ' + e.message);
    }

    res.json({ 
        message: 'Backend is ALIVE',
        version: 'v1.4-diagnostic-active-test-email',
        server_directory: __dirname,
        server_filename: __filename,
        database: dbStatus,
        path_received: req.path,
        original_url: req.originalUrl,
        loaded_routes: routes
    });
};

app.get('/api/test', testHandler);
app.get('/test', testHandler);
app.get('/', (req, res) => res.json({ message: 'API Root' }));

// =========================================================
// DIAGNOSTIC: Test Email Endpoint (Safe to remove later)
// =========================================================
app.get('/api/test-email', async (req, res) => {
    try {
        const nodemailer = require('nodemailer');

        const SMTP_HOST = process.env.EMAIL_HOST || 'mail.gethotelstays.com';
        const SMTP_PORT = parseInt(process.env.EMAIL_PORT || '465');
        const SMTP_USER = process.env.EMAIL_USER || 'reservation@gethotelstays.com';
        const SMTP_PASS = process.env.EMAIL_PASS || 'shriyanshking';

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: true,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
            tls: { rejectUnauthorized: false }
        });

        // Verify SMTP connection first
        await transporter.verify();

        // Send a test email
        const info = await transporter.sendMail({
            from: `"GetHotelStays Test" <${SMTP_USER}>`,
            to: req.query.to || SMTP_USER,
            subject: '✅ Live Server Email Test',
            text: 'This email confirms the live server SMTP is working correctly!'
        });

        res.json({ 
            success: true, 
            message: 'Email sent successfully!',
            smtp_host: SMTP_HOST,
            smtp_port: SMTP_PORT,
            smtp_user: SMTP_USER,
            env_email_host: process.env.EMAIL_HOST || 'NOT SET (using hardcoded)',
            env_email_user: process.env.EMAIL_USER || 'NOT SET (using hardcoded)',
            messageId: info.messageId
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: err.message,
            smtp_host: process.env.EMAIL_HOST || 'mail.gethotelstays.com',
            smtp_port: process.env.EMAIL_PORT || '465',
            smtp_user: process.env.EMAIL_USER || 'reservation@gethotelstays.com',
            env_email_host: process.env.EMAIL_HOST || 'NOT SET',
            env_email_user: process.env.EMAIL_USER || 'NOT SET',
            stack: err.stack
        });
    }
});

// Route files
const auth = require('./routes/authRoutes');
const hotels = require('./routes/hotelRoutes');
const bookings = require('./routes/bookingRoutes');
const dailyRates = require('./routes/dailyRateRoutes');
const payments = require('./routes/paymentRoutes');
const partner = require('./routes/partnerRoutes');
const admin = require('./routes/adminRoutes');
const notifications = require('./routes/notificationRoutes');
const messages = require('./routes/messageRoutes');

// Mount routes (Matching both for flexibility)
const mount = (prefix) => {
    app.use(`${prefix}/auth`, auth);
    app.use(`${prefix}/hotels`, hotels);
    app.use(`${prefix}/bookings`, bookings);
    app.use(`${prefix}/daily-rates`, dailyRates);
    app.use(`${prefix}/payments`, payments);
    app.use(`${prefix}/partner`, partner);
    app.use(`${prefix}/admin`, admin);
    app.use(`${prefix}/notifications`, notifications);
    app.use(`${prefix}/messages`, messages);
};

mount('/api');
mount(''); // Also mount at root as fallback

// Error handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
