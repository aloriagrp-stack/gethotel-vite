const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a room name'],
        trim: true,
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: true,
    },
    bedConfiguration: {
        type: String,
        required: [true, 'Please specify bed type (e.g., King, Queen, Twin)'],
    },
    sizeM2: {
        type: Number,
        required: [true, 'Please add room size in m2'],
    },
    maxOccupancy: {
        type: Number,
        required: [true, 'Please add max occupancy'],
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Please add price per night'],
    },
    amenities: [String],
    images: [String],
    isAvailable: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Room', RoomSchema);
