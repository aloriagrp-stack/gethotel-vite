const nodemailer = require('nodemailer');
require('dotenv').config();

const SMTP_HOST = process.env.EMAIL_HOST || 'mail.gethotelstays.com';
const SMTP_PORT = parseInt(process.env.EMAIL_PORT || '465');
const SMTP_USER = process.env.EMAIL_USER || 'reservation@gethotelstays.com';
const SMTP_PASS = process.env.EMAIL_PASS || 'shriyanshking';
const SMTP_SECURE = process.env.EMAIL_SECURE !== undefined 
    ? (process.env.EMAIL_SECURE === 'true') 
    : (SMTP_PORT === 465);

const transporterOptions = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
};

console.log('Transporter Options:', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    user: SMTP_USER
});

const transporter = nodemailer.createTransport(transporterOptions);

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Verification Failed:', error);
    } else {
        console.log('SMTP Server is ready to take our messages!');
        
        // Send a test mail
        const mailOptions = {
            from: `"GetHotelStays Test" <${SMTP_USER}>`,
            to: 'kammoji44@gmail.com',
            subject: 'SMTP Connection Test',
            text: 'Hello, this is a test email to verify SMTP configuration.'
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Test Mail Sending Failed:', err);
            } else {
                console.log('Test Mail Sent Successfully:', info.response);
            }
            process.exit(0);
        });
    }
});
