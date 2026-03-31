const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, getOrders, getOrderById, updateOrder, getOrderStats } = require('../controllers/orderController');

// Public
router.post('/', createOrder);
router.get('/:id', getOrderById);

// Admin
router.get('/', protect, getOrders);
router.get('/admin/stats', protect, getOrderStats);
router.put('/:id', protect, updateOrder);

module.exports = router;
