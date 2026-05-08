// Add a simple health route to server.js temporarily
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Load the exact same prisma as the server uses
const prisma = require('../config/db');

app.get('/health', async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany({ take: 1, select: { id: true, name: true } });
        res.json({ success: true, hotels });
    } catch(e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.listen(5001, async () => {
    console.log('Test server on 5001');
    try {
        await prisma.$connect();
        console.log('DB connected on startup');
    } catch(e) {
        console.error('DB failed:', e.message);
    }
});
