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
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), createCoupon);

router.route('/:hotelId/coupons/:id')
    .put(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateCoupon)
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateCoupon)
    .patch(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), toggleCouponStatus)
    .delete(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), deleteCoupon);

// Nested routes for staff
router.route('/:hotelId/staff')
    .get(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), getStaff)
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), addStaff);

router.route('/:hotelId/staff/:staffId')
    .delete(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), removeStaff);

// Nested routes for rooms
router.route('/:hotelId/rooms')
    .get(getRooms)
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), addRoom);

router.route('/:hotelId/rooms/bulk')
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), bulkUpdateRooms);

router.route('/:hotelId/rooms/:roomId')
    .put(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateRoom)
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateRoom)
    .delete(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), deleteRoom);

router.route('/')
    .get(getHotels)
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), hotelValidation, createHotel);

router.route('/my-hotels')
    .get(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), getMyHotels);

router.route('/:id')
    .get(getHotel)
    .put(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateHotel)
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), updateHotel)
    .delete(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), deleteHotel);

router.route('/:id/reviews')
    .post(protect, createReview);

router.route('/:hotelId/reviews/:reviewId/reply')
    .post(protect, authorize('hotel_admin', 'super_admin', 'partner', 'admin', 'superadmin'), replyToReview);

module.exports = router;
