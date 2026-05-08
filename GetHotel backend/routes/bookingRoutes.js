const express = require('express');
const {
    createBooking,
    getMyBookings,
    getBookings,
    updateBooking
} = require('../controllers/bookingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(authorize('super_admin'), getBookings)
    .post(createBooking);

router.route('/my-bookings')
    .get(getMyBookings);

router.route('/:id')
    .put(authorize('hotel_admin', 'super_admin'), updateBooking);

module.exports = router;
