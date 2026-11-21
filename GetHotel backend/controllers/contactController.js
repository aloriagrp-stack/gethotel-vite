const prisma = require('../config/db');
const { sendContactEmail } = require('../utils/emailService');

// Create contact inquiry table if not exists (raw query fallback for safety)
let tableInitialized = false;
async function ensureContactTable() {
    if (tableInitialized) return;
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS contact_inquiry (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NULL,
                message TEXT NOT NULL,
                ip VARCHAR(64) NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        tableInitialized = true;
    } catch (err) {
        console.warn("Could not ensure contact_inquiry table:", err.message);
    }
}

exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required fields.",
            });
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        // 1. Save in database
        try {
            await ensureContactTable();
            await prisma.$executeRawUnsafe(`
                INSERT INTO contact_inquiry (name, email, subject, message, ip, createdAt)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, name.trim(), email.trim(), (subject || '').trim(), message.trim(), String(ip).slice(0, 64));
        } catch (dbErr) {
            console.error("Error saving contact inquiry in DB:", dbErr.message);
            // Continue even if DB log fails so email goes through
        }

        // 2. Dispatch Email
        try {
            await sendContactEmail({
                name: name.trim(),
                email: email.trim(),
                subject: (subject || '').trim(),
                message: message.trim(),
            });
        } catch (emailErr) {
            console.error("Email dispatch failed for contact form:", emailErr.message);
            // Even if SMTP temporarily fails, DB already has the message
        }

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully. We will get back to you shortly.",
        });
    } catch (error) {
        console.error("Contact form error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process your request. Please try again or contact us via phone.",
        });
    }
};
