require('dotenv').config();
const { sendBookingEmails } = require('../utils/emailService');

const mockBooking = {
    id: 123, // Will render as #GH-10123
    guestName: "Shriyansh King",
    guestEmail: "reservation@gethotelstays.com", // Sends the customer ticket here
    guestPhone: "+91 99999 88888",
    hotel: {
        name: "Cottage Yes Please",
        address: "1843, Laxmi Narain Street, Paharganj",
        city: "New Delhi",
        email: "reservation@gethotelstays.com" // Sends the hotelier alert here too
    },
    room: {
        name: "Double Deluxe Room"
    },
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 nights stay
    totalPrice: 5880,
    amountPaid: 1058 // 18% booking fee paid
};

console.log("Sending live test booking emails using the new luxury HTML templates...");

sendBookingEmails(mockBooking)
    .then(() => {
        console.log("Live test emails sent successfully! Check your reservation@gethotelstays.com inbox.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Failed to send live test emails:", err);
        process.exit(1);
    });
