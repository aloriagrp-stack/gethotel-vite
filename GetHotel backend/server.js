const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const errorHandler = require('./middleware/error');

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

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');



const app = express();

// Enable CORS - Must be before other middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.razorpay.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"]
        },
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 20, // limit each IP to 20 requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes'
});
app.use('/api/auth', authLimiter);

// Prevent http param pollution
app.use(hpp());

// Mount routers
app.use('/api/auth', auth);

// DIAGNOSTIC: Test route before all other routes to check Prisma
const _prismaTest = require('./config/db');
app.get('/api/test-db', async (req, res) => {
    try {
        const hotels = await _prismaTest.hotel.findMany({ take: 1, select: { id: true, name: true } });
        res.json({ success: true, hotels });
    } catch(e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.use('/api/hotels', hotels);
app.use('/api/bookings', bookings);
app.use('/api/daily-rates', dailyRates);
app.use('/api/payments', payments);
app.use('/api/partner', partner);
app.use('/api/admin', admin);
app.use('/api/notifications', notifications);
app.use('/api/messages', messages);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Test DB Connection
    try {
        const prisma = require('./config/db');
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
