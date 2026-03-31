const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, checkPaymentStatus } = require('../controllers/paymentController');

router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);
router.get('/status/:merchantTransactionId', checkPaymentStatus);

module.exports = router;
