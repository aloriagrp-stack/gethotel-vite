// GetHotel Backend Server
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const fs = require('fs');
const path = require('path');
const { sanitizeInput } = require('./middleware/sanitizeInput');
const errorHandler = require('./middleware/error');
const { 
    ipBlocker, botScanner, requestSizeLimiter, 
    globalLimiter, authLimiter, throttler, csrfHandler 
} = require('./middleware/security');
const { requestImageProcessor, responseImageResolver } = require('./middleware/imageUpload');

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// 1. Core security checks (IP blocking, Bots, Size Limits)
app.use(ipBlocker);
app.use(botScanner);
app.use(requestSizeLimiter);
app.use(throttler);

// Image Response URL Mapper & Static uploads server
app.use(responseImageResolver);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Structured API Request Logger
const requestLogger = (req, res, next) => {
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '';
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: ip.replace(/^::ffff:/, ''),
        userAgent: req.headers['user-agent']
    };
    fs.appendFileSync(path.join(logDir, 'api_requests.log'), JSON.stringify(logEntry) + '\n');
    next();
};
app.use(requestLogger);

// 3. Secure Headers Configuration
app.use(helmet({
    contentSecurityPolicy: false, // API server, no frontend assets served directly
    crossOriginEmbedderPolicy: false
}));

// 4. Hardened CORS Whitelist
const whitelist = [
    process.env.FRONTEND_URL,
    'https://gethotelstays.com',
    'https://www.gethotelstays.com',
    'http://localhost:5173',
    'http://localhost:3000'
].map(url => url ? url.trim().replace(/\/$/, '') : '').filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
        } else {
            const cleanOrigin = origin.trim().replace(/\/$/, '');
            const isWhitelisted = whitelist.indexOf(cleanOrigin) !== -1;
            const isSameDomain = cleanOrigin.endsWith('gethotelstays.com');
            
            const isDevelopment = process.env.NODE_ENV === 'development';
            const isLocalhost = cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:');
            
            if (isWhitelisted || isSameDomain || (isDevelopment && isLocalhost)) {
                callback(null, true);
            } else {
                console.error(`[CORS Blocked] origin=${origin}, cleanOrigin=${cleanOrigin}, whitelist=`, whitelist);
                callback(new Error('Blocked by CORS policy'));
            }
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '15mb' })); // Restricted payload limit (15MB)
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(cookieParser());
app.use(sanitizeInput); // escape dangerous HTML tags and block query pollution
app.use(hpp()); // Prevent HTTP parameter pollution
app.use(requestImageProcessor);
app.use(morgan('dev'));

// 5. Apply Auth Rate Limiting to specific sensitive prefixes
app.use('/api/auth', authLimiter);
app.use('/auth', authLimiter);

// 6. Global API Rate Limiter
app.use('/api', globalLimiter);
app.use(csrfHandler);

// Diagnostic test routes (Matching both with and without /api)
const testHandler = async (req, res) => {
    let dbStatus = 'Checking...';
    let fixResults = null;

    // Quick DB fix mode: ?fix_token=gethotel_maint_2026
    if (req.query.fix_token === 'gethotel_maint_2026') {
        fixResults = [];
        try {
            const mysql = require('mysql2/promise');
            const dbUrl = process.env.DATABASE_URL || '';
            const m = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:/]+)(?::(\d+))?\/(.+)/);
            if (m) {
                const conn = await mysql.createConnection({
                    host: m[3], user: m[1], password: m[2],
                    database: m[5], port: parseInt(m[4] || '3306')
                });
                const [cols] = await conn.execute("SHOW COLUMNS FROM hotel LIKE 'isActive'");
                if (cols.length === 0) {
                    await conn.execute("ALTER TABLE `hotel` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1");
                    await conn.execute("UPDATE `hotel` SET `isActive`=1");
                    fixResults.push('isActive column ADDED - all hotels set active');
                } else {
                    fixResults.push('isActive column already exists');
                }
                const [cnt] = await conn.execute("SELECT COUNT(*) as c FROM hotel WHERE isActive=1");
                fixResults.push('Active hotels: ' + cnt[0].c);
                await conn.end();
                const { execSync } = require('child_process');
                const path = require('path');
                const nodeBin = process.execPath;
                const prismaJs = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');
                try {
                    execSync(`"${nodeBin}" "${prismaJs}" generate`, {
                        cwd: __dirname, timeout: 90000,
                        env: { ...process.env, PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true' }
                    });
                    fixResults.push('Prisma regenerated OK');
                    const fs = require('fs');
                    const tmpDir = path.join(__dirname, 'tmp');
                    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
                    fs.writeFileSync(path.join(tmpDir, 'restart.txt'), Date.now().toString());
                    fixResults.push('Restart triggered');
                } catch (e) {
                    fixResults.push('Prisma regen warn: ' + e.message.slice(0, 150));
                }
            } else {
                fixResults.push('Cannot parse DATABASE_URL');
            }
        } catch (e) {
            fixResults.push('Fix error: ' + e.message);
        }
    }

    try {
        const prisma = require('./config/db');
        await prisma.$connect();
        dbStatus = 'Connected!';
    } catch (err) {
        dbStatus = 'Failed: ' + err.message;
    }

    res.json({
        message: 'Backend is ALIVE',
        version: 'v2.7-AI-COPILOT-REDEPLOY-16JUN',
        server_directory: __dirname,
        database: dbStatus,
        fix_results: fixResults,
        path_received: req.path,
    });
};


app.get('/api/test', testHandler);
app.get('/test', testHandler);
app.get('/', (req, res) => res.json({ message: 'API Root' }));

// =========================================================
// TEMPORARY MAINTENANCE: Fix isActive column + regenerate prisma
// Remove after fix is confirmed working
// =========================================================
app.get('/api/maintenance/fix-db', async (req, res) => {
    const token = req.query.token;
    if (token !== 'gethotel_maint_2026') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const results = [];
    try {
        const { execSync } = require('child_process');
        const path = require('path');

        // Step 1: Use mysql2 directly to add columns (bypasses Prisma client)
        const mysql = require('mysql2/promise');
        const dbUrl = process.env.DATABASE_URL || '';
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:/]+)(?::(\d+))?\/(.+)/);
        if (!match) throw new Error('Cannot parse DATABASE_URL: ' + dbUrl);
        const [, user, pass, host, port, dbname] = match;

        const conn = await mysql.createConnection({
            host, user, password: pass, database: dbname, port: parseInt(port || '3306')
        });

        // Helper to add column if it doesn't exist
        const addColumnIfMissing = async (table, column, definition) => {
            const [cols] = await conn.execute(`SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`);
            if (cols.length === 0) {
                await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
                results.push(`✅ Column \`${column}\` added to table \`${table}\``);
                return true;
            } else {
                results.push(`ℹ️ Column \`${column}\` already exists in table \`${table}\``);
                return false;
            }
        };

        // Helper to add unique key if it doesn't exist
        const addUniqueIndexIfMissing = async (table, indexName, column) => {
            const [indexes] = await conn.execute(`SHOW INDEX FROM \`${table}\` WHERE Key_name = '${indexName}'`);
            if (indexes.length === 0) {
                await conn.execute(`ALTER TABLE \`${table}\` ADD UNIQUE KEY \`${indexName}\` (\`${column}\`)`);
                results.push(`✅ Unique index \`${indexName}\` added to table \`${table}\``);
            } else {
                results.push(`ℹ️ Unique index \`${indexName}\` already exists in table \`${table}\``);
            }
        };

        // 1. Check and sync Gethotel Hotel columns
        await addColumnIfMissing('hotel', 'isActive', "TINYINT(1) NOT NULL DEFAULT 1 AFTER `responseSpeed`");
        await addColumnIfMissing('hotel', 'otaApiKey', "VARCHAR(191) DEFAULT NULL AFTER `isActive`");
        await addColumnIfMissing('hotel', 'otaEnabled', "TINYINT(1) NOT NULL DEFAULT 0 AFTER `otaApiKey`");
        await addUniqueIndexIfMissing('hotel', 'Hotel_otaApiKey_key', 'otaApiKey');

        // 2. Check and sync Gethotel Room columns
        await addColumnIfMissing('room', 'status', "VARCHAR(191) NOT NULL DEFAULT 'active'");
        await addColumnIfMissing('room', 'totalInventory', "INT(11) NOT NULL DEFAULT 1");
        await addColumnIfMissing('room', 'viewType', "VARCHAR(191) DEFAULT NULL");
        await addColumnIfMissing('room', 'floorNumber', "INT(11) DEFAULT NULL");
        await addColumnIfMissing('room', 'isCornerRoom', "TINYINT(1) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'capacityAdults', "INT(11) NOT NULL DEFAULT 2");
        await addColumnIfMissing('room', 'capacityChildren', "INT(11) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'capacityInfants', "INT(11) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'extraMattress', "TINYINT(1) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'extraBedCharge', "DOUBLE NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'tags', "TEXT DEFAULT NULL");
        await addColumnIfMissing('room', 'isFeatured', "TINYINT(1) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'displayPriority', "INT(11) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'videoUrl', "TEXT DEFAULT NULL");
        await addColumnIfMissing('room', 'media360Url', "TEXT DEFAULT NULL");
        await addColumnIfMissing('room', 'minStay', "INT(11) NOT NULL DEFAULT 1");
        await addColumnIfMissing('room', 'maxStay', "INT(11) NOT NULL DEFAULT 90");
        await addColumnIfMissing('room', 'isInstantBooking', "TINYINT(1) NOT NULL DEFAULT 1");
        await addColumnIfMissing('room', 'advanceBookingDays', "INT(11) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'advancePayment', "INT(11) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'securityDeposit', "DOUBLE NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'isRefundable', "TINYINT(1) NOT NULL DEFAULT 1");
        await addColumnIfMissing('room', 'isTaxIncluded', "TINYINT(1) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'weekendPricing', "TEXT DEFAULT NULL");
        await addColumnIfMissing('room', 'seasonalPricing', "TEXT DEFAULT NULL");
        await addColumnIfMissing('room', 'addOns', "TEXT DEFAULT NULL");
        await addColumnIfMissing('room', 'petsAllowed', "TINYINT(1) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'smokingAllowed', "TINYINT(1) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'alcoholAllowed', "TINYINT(1) NOT NULL DEFAULT 1");
        await addColumnIfMissing('room', 'partyAllowed', "TINYINT(1) NOT NULL DEFAULT 0");
        await addColumnIfMissing('room', 'seoTitle', "VARCHAR(191) DEFAULT NULL");
        await addColumnIfMissing('room', 'seoDescription', "TEXT DEFAULT NULL");
        await addColumnIfMissing('room', 'slug', "VARCHAR(191) DEFAULT NULL");
        await addUniqueIndexIfMissing('room', 'Room_slug_key', 'slug');

        await conn.end();

        const rootDir = __dirname;
        const nodeBin = process.execPath;
        const prismaJs = path.join(rootDir, 'node_modules', 'prisma', 'build', 'index.js');
        try {
            const out = execSync(`"${nodeBin}" "${prismaJs}" generate`, {
                cwd: rootDir, timeout: 90000,
                env: { ...process.env, PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true' }
            }).toString();
            results.push('✅ Prisma regenerated: ' + (out.includes('Generated') ? 'SUCCESS' : out.slice(0, 100)));
            
            // Trigger Passenger App Restart
            const tmpDir = path.join(rootDir, 'tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }
            fs.writeFileSync(path.join(tmpDir, 'restart.txt'), Date.now().toString());
            results.push('✅ Passenger application restart triggered via tmp/restart.txt');
        } catch (e) {
            results.push('⚠️ Prisma regen failed: ' + e.message.slice(0, 200));
        }

        res.json({ success: true, results, message: 'Database sync, Prisma regeneration, and restart triggered successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, results });
    }
});

// =========================================================
// DIAGNOSTIC: Test Scraper Connection on Live Server
// =========================================================
app.get('/api/maintenance/test-scraper', async (req, res) => {
    try {
        const testUrl = req.query.url || 'https://www.booking.com/hotel/in/natraj-yes-please.html';
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        const checkinStr = tomorrow.toISOString().split('T')[0];
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 8);
        const checkoutStr = dayAfter.toISOString().split('T')[0];
        
        let targetUrl = testUrl.trim();
        const match = targetUrl.match(/booking\.com(\/hotel\/[a-zA-Z0-9_\-\/]+\.html)/i)
                   || targetUrl.match(/booking\.com(\/hotel\/[a-zA-Z0-9_\-\/]+)/i);
        if (match) {
            const path = match[1];
            targetUrl = `https://www-booking-com.translate.goog${path}?_x_tr_sl=auto&_x_tr_tl=en&checkin=${checkinStr}&checkout=${checkoutStr}&group_adults=2&no_rooms=1&group_children=0&selected_currency=INR`;
        }
        
        const fetch = require('node-fetch');
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });
        
        const text = await response.text();
        
        res.json({
            success: true,
            status: response.status,
            ok: response.ok,
            htmlLength: text.length,
            targetUrl,
            hasRoomsAvailable: text.includes('b_rooms_available_and_soldout'),
            hasRoomTranslation: text.includes('RoomTranslation'),
            hasRoomData: text.includes('RoomData'),
            hasHotel: text.includes('"Hotel"'),
            sampleStart: text.slice(0, 500)
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message, stack: e.stack });
    }
});

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
const analytics = require('./routes/analyticsRoutes');
const homepage = require('./routes/homepageRoutes');
const ota = require('./routes/otaRoutes');
const ai = require('./routes/aiRoutes');
const { protect, authorize } = require('./middleware/auth');
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const hotelController = require('./controllers/hotelController');

// Critical production routes mounted explicitly so manual/cPanel uploads cannot miss them.
// These duplicate the router definitions intentionally for backwards-compatible live fixes.
const mountCriticalRoutes = (prefix) => {
    app.post(`${prefix}/auth/send-otp`, authController.sendOTP);
    app.post(`${prefix}/auth/verify-otp`, authController.verifyOTP);
    app.post(`${prefix}/auth/change-password/send-otp`, protect, authController.sendChangePasswordOTP);
    app.post(`${prefix}/auth/change-password/verify-otp`, protect, authController.verifyChangePasswordOTP);
    app.post(`${prefix}/auth/change-email/send-otp`, protect, authController.sendChangeEmailOTP);
    app.post(`${prefix}/auth/change-email/verify-otp`, protect, authController.verifyChangeEmailOTP);
    app.post(`${prefix}/hotels`, protect, authorize('hotel_admin', 'super_admin'), hotelController.createHotel);
    app.delete(`${prefix}/admin/hotels/:id`, protect, authorize('super_admin'), adminController.deleteHotel);
};

mountCriticalRoutes('/api');
mountCriticalRoutes('');

// Mount routes (Matching both for flexibility)
const mount = (prefix) => {
    app.use(`${prefix}/auth`, auth);
    app.use(`${prefix}/hotels`, hotels);
    app.use(`${prefix}/bookings`, bookings);
    app.use(`${prefix}/daily-rates`, dailyRates);
    app.use(`${prefix}/payments`, payments);
    app.use(`${prefix}/partner`, partner);
    app.use(`${prefix}/admin/ai`, ai);
    app.use(`${prefix}/admin`, admin);
    app.use(`${prefix}/notifications`, notifications);
    app.use(`${prefix}/messages`, messages);
    app.use(`${prefix}/analytics`, analytics);
    app.use(`${prefix}/homepage`, homepage);
    app.use(`${prefix}/ota`, ota);
};

mount('/api');
mount(''); // Also mount at root as fallback

app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route not found: ${req.method} ${req.originalUrl}`
    });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
