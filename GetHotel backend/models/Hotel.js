const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters'],
    },
    slug: String,
    tagline: {
        type: String,
        required: [true, 'Please add a tagline'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    city: {
        type: String,
        required: [true, 'Please add a city'],
    },
    country: {
        type: String,
        default: 'India',
    },
    starRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
    },
    guestRating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Please add a starting price'],
    },
    images: [String],
    thumbnail: String,
    amenities: [String],
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isTrending: {
        type: Boolean,
        default: false,
    },
    badge: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Cascade delete rooms when a hotel is deleted
HotelSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    console.log(`Rooms being removed from hotel ${this._id}`);
    await this.model('Room').deleteMany({ hotel: this._id });
    next();
});

// Reverse populate with virtuals
HotelSchema.virtual('rooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'hotel',
    justOne: false
});

module.exports = mongoose.model('Hotel', HotelSchema);
