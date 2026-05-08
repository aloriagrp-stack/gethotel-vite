const express = require('express');
const {
    getHotels,
    getHotel,
    createHotel,
    updateHotel,
    deleteHotel,
    getMyHotels,
    createReview,
    replyToReview
} = require('../controllers/hotelController');

const { getRooms, addRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { getStaff, addStaff, removeStaff } = require('../controllers/staffController');
const { getCoupons, createCoupon, toggleCouponStatus, deleteCoupon } = require('../controllers/couponController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Nested routes for coupons
router.route('/:hotelId/coupons')
    .get(protect, authorize('hotel_admin', 'super_admin'), getCoupons)
    .post(protect, authorize('hotel_admin', 'super_admin'), createCoupon);

router.route('/:hotelId/coupons/:id')
    .patch(protect, authorize('hotel_admin', 'super_admin'), toggleCouponStatus)
    .delete(protect, authorize('hotel_admin', 'super_admin'), deleteCoupon);

// Nested routes for staff
router.route('/:hotelId/staff')
    .get(protect, authorize('hotel_admin', 'super_admin'), getStaff)
    .post(protect, authorize('hotel_admin', 'super_admin'), addStaff);

router.route('/:hotelId/staff/:staffId')
    .delete(protect, authorize('hotel_admin', 'super_admin'), removeStaff);

// Nested routes for rooms
router.route('/:hotelId/rooms')
    .get(getRooms)
    .post(protect, authorize('hotel_admin', 'super_admin'), addRoom);

router.route('/:hotelId/rooms/:roomId')
    .put(protect, authorize('hotel_admin', 'super_admin'), updateRoom)
    .delete(protect, authorize('hotel_admin', 'super_admin'), deleteRoom);

router.route('/')
    .get(getHotels)
    .post(protect, authorize('hotel_admin', 'super_admin'), createHotel);

router.route('/my-hotels')
    .get(protect, authorize('hotel_admin', 'super_admin'), getMyHotels);

router.route('/:id')
    .get(getHotel)
    .put(protect, authorize('hotel_admin', 'super_admin'), updateHotel)
    .delete(protect, authorize('hotel_admin', 'super_admin'), deleteHotel);

router.route('/:id/reviews')
    .post(protect, createReview);

router.route('/:hotelId/reviews/:reviewId/reply')
    .post(protect, authorize('hotel_admin', 'super_admin'), replyToReview);

module.exports = router;
