const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOffer, getOffers, deleteOffer } = require('../controllers/offerController');

router.get('/', protect, getOffers);
router.post('/', protect, createOffer);
router.delete('/:id', protect, deleteOffer);

module.exports = router;
