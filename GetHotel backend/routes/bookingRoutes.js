const express = require('express');
const {
    createBooking,
    getMyBookings,
    getBookings,
    getBooking,
    updateBooking,
    cancelBooking
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
    .get(getBooking)
    .put(authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateBooking)
    .post(authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateBooking);

router.route('/:id/cancel')
    .post(cancelBooking)
    .put(cancelBooking);

module.exports = router;
