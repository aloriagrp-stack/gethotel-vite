require('dotenv').config();
const express = require('express');
const mysql2 = require('mysql2/promise');
const prisma = require('../config/db');

const app = express();

// Test 1: Direct mysql2 connection from within Express handler
app.get('/test-mysql2', async (req, res) => {
    try {
        const conn = await mysql2.createConnection('mysql://root:@127.0.0.1:3306/gethotel');
        const [rows] = await conn.execute('SELECT COUNT(*) as count FROM hotel');
        await conn.end();
        res.json({ success: true, method: 'mysql2', count: rows[0].count });
    } catch(e) {
        res.status(500).json({ success: false, method: 'mysql2', error: e.message });
    }
});

// Test 2: Prisma from within Express handler (using same config/db.js)
app.get('/test-prisma', async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany({ take: 1, select: { id: true, name: true } });
        res.json({ success: true, method: 'prisma', hotels });
    } catch(e) {
        res.status(500).json({ success: false, method: 'prisma', error: e.message });
    }
});

app.listen(5002, () => console.log('Comparison server on :5002'));
