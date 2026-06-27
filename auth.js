const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authGuard } = require('../middleware/auth');
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, status: user.status }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, appStatus: user.appStatus } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, appStatus: user.appStatus, appFeedback: user.appFeedback } });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', authGuard, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
