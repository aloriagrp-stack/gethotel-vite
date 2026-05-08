const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: true,
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true,
    },
    checkIn: {
        type: Date,
        required: [true, 'Please add a check-in date'],
    },
    checkOut: {
        type: Date,
        required: [true, 'Please add a check-out date'],
    },
    totalGuests: {
        type: Number,
        required: [true, 'Please add number of guests'],
    },
    totalPrice: {
        type: Number,
        required: [true, 'Please add total price'],
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
