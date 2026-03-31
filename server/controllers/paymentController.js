const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Order = require('../models/Order');

// POST /api/payment/initiate
const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, userPhone } = req.body;

    const merchantTransactionId = `MT_${uuidv4().replace(/-/g, '').substring(0, 20)}`;

    // Update order with merchantTransactionId
    await Order.findByIdAndUpdate(orderId, { merchantTransactionId });

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: `USER_${userPhone}`,
      amount: Math.round(amount * 100), // in paise
      redirectUrl: `${process.env.PHONEPE_REDIRECT_URL}?orderId=${orderId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: process.env.PHONEPE_CALLBACK_URL,
      mobileNumber: userPhone,
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const checksumStr = `${base64Payload}/pg/v1/pay${saltKey}`;
    const checksum = crypto.createHash('sha256').update(checksumStr).digest('hex');
    const xVerify = `${checksum}###${saltIndex}`;

    const response = await axios.post(
      `${process.env.PHONEPE_BASE_URL}/pg/v1/pay`,
      { request: base64Payload },
      { headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify } }
    );

    const redirectUrl = response.data?.data?.instrumentResponse?.redirectInfo?.url;
    if (!redirectUrl) throw new Error('Payment URL not received from PhonePe');

    res.json({ success: true, data: { redirectUrl, merchantTransactionId } });
  } catch (err) {
    console.error('PhonePe Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Payment initiation failed', error: err.message });
  }
};

// POST /api/payment/verify (PhonePe webhook callback)
const verifyPayment = async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) return res.status(400).json({ success: false });

    const payloadDecoded = JSON.parse(Buffer.from(response, 'base64').toString('utf8'));
    const { merchantTransactionId, transactionId, code } = payloadDecoded.data || payloadDecoded;

    // Verify checksum
    const xVerifyHeader = req.headers['x-verify'];
    if (xVerifyHeader) {
      const [receivedChecksum] = xVerifyHeader.split('###');
      const saltKey = process.env.PHONEPE_SALT_KEY;
      const saltIndex = process.env.PHONEPE_SALT_INDEX;
      const expectedChecksum = crypto
        .createHash('sha256')
        .update(`${response}${saltKey}`)
        .digest('hex');
      if (receivedChecksum !== expectedChecksum) {
        console.warn('PhonePe checksum mismatch');
      }
    }

    const isSuccess = code === 'PAYMENT_SUCCESS';
    const order = await Order.findOneAndUpdate(
      { merchantTransactionId },
      {
        paymentStatus: isSuccess ? 'paid' : 'failed',
        status: isSuccess ? 'paid' : 'pending',
        transactionId: transactionId || '',
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payment/status/:merchantTransactionId
const checkPaymentStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const merchantId = process.env.PHONEPE_MERCHANT_ID;

    const checksumStr = `/pg/v1/status/${merchantId}/${merchantTransactionId}${saltKey}`;
    const checksum = crypto.createHash('sha256').update(checksumStr).digest('hex');
    const xVerify = `${checksum}###${saltIndex}`;

    const response = await axios.get(
      `${process.env.PHONEPE_BASE_URL}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      { headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify, 'X-MERCHANT-ID': merchantId } }
    );

    const isSuccess = response.data?.code === 'PAYMENT_SUCCESS';
    if (isSuccess) {
      await Order.findOneAndUpdate(
        { merchantTransactionId },
        { paymentStatus: 'paid', status: 'paid', transactionId: response.data?.data?.transactionId || '' }
      );
    }
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { initiatePayment, verifyPayment, checkPaymentStatus };
