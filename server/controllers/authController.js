const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({ success: true, token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/seed-admin  (one-time admin creation)
const seedAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ email: 'admin@grainzz.com' });
    if (existing) return res.json({ success: true, message: 'Admin already exists' });
    await User.create({ email: 'admin@grainzz.com', password: 'Grainzz@2026', role: 'admin' });
    res.json({ success: true, message: 'Admin created: admin@grainzz.com / Grainzz@2026' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login, seedAdmin };
