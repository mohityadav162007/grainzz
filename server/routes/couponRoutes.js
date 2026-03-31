const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createCoupon, getCoupons, deleteCoupon, applyCoupon } = require('../controllers/couponController');

// Public
router.post('/apply', applyCoupon);

// Admin
router.post('/', protect, createCoupon);
router.get('/', protect, getCoupons);
router.delete('/:id', protect, deleteCoupon);

module.exports = router;
