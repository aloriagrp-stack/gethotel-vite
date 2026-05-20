require('dotenv').config(); // Load local .env variables
const { sendBookingEmails } = require('../utils/emailService');

async function testEmail() {
    console.log('Testing email functionality locally...');
    
    // Mock booking data matching the expected structure
    const mockBooking = {
        id: 999,
        guestName: 'Local Test User',
        guestEmail: 'aloriagrp@gmail.com', // Change this if you want to test a different receiver
        guestPhone: '+919876543210',
        hotel: {
            name: 'Local Test Luxury Hotel',
            address: '123 Test Avenue',
            city: 'Testville',
            email: 'admin@gethotelstays.com' // Hotelier destination email
        },
        room: {
            name: 'Presidential Test Suite'
        },
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000), // +1 day
        totalPrice: 15000,
        amountPaid: 2700
    };

    try {
        await sendBookingEmails(mockBooking);
        console.log('Test completed successfully. Check the inbox of ' + mockBooking.guestEmail);
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

testEmail();
