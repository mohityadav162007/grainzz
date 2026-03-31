const express = require('express');
const router = express.Router();
const { login, seedAdmin } = require('../controllers/authController');

router.post('/login', login);
router.post('/seed-admin', seedAdmin);

module.exports = router;
