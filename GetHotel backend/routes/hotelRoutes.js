const express = require('express');
const {
    getHotels,
    getHotel,
    searchHotels,
    createHotel,
    updateHotel,
    deleteHotel,
    getMyHotels,
    createReview,
    replyToReview,
    getSearchSuggestions
} = require('../controllers/hotelController');

const { getRooms, addRoom, updateRoom, deleteRoom, bulkUpdateRooms } = require('../controllers/roomController');
const { getStaff, addStaff, removeStaff } = require('../controllers/staffController');
const { getCoupons, createCoupon, updateCoupon, toggleCouponStatus, deleteCoupon } = require('../controllers/couponController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate');

const hotelValidation = [
    check('name', 'Hotel name is required').notEmpty().trim(),
    check('city', 'City is required').notEmpty().trim(),
    check('address', 'Address is required').notEmpty().trim(),
    check('pricePerNight', 'Valid price per night is required')
        .if((value, { req }) => !req.body.isDraft)
        .isFloat({ min: 0 }),
    validate
];

// Advanced Search
router.get('/search', searchHotels);
router.get('/search-suggestions', getSearchSuggestions);

// Trending Hotels (defined before wildcard /:id)
const { getTrendingHotels } = require('../controllers/homepageController');
router.get('/trending', getTrendingHotels);

// Nested routes for coupons
router.route('/:hotelId/coupons')
    .get(getCoupons)
    .post(protect, authorize('hotel_admin', 'super_admin'), createCoupon);

router.route('/:hotelId/coupons/:id')
    .put(protect, authorize('hotel_admin', 'super_admin'), updateCoupon)
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

router.route('/:hotelId/rooms/bulk')
    .post(protect, authorize('hotel_admin', 'super_admin'), bulkUpdateRooms);

router.route('/:hotelId/rooms/:roomId')
    .put(protect, authorize('hotel_admin', 'super_admin'), updateRoom)
    .delete(protect, authorize('hotel_admin', 'super_admin'), deleteRoom);

router.route('/')
    .get(getHotels)
    .post(protect, authorize('hotel_admin', 'super_admin'), hotelValidation, createHotel);

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
