const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ClassModel = require('../models/Class');
const { authGuard, blockedGuard } = require('../middleware/auth');

const router = express.Router();
router.use(authGuard, blockedGuard);

router.get('/favorites', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ paidAt: -1 });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

router.post('/apply-trainer', async (req, res, next) => {
  try {
    const { experience, specialty } = req.body;
    if (!experience || !specialty) return res.status(400).json({ message: 'Experience and specialty are required.' });
    const user = await User.findById(req.user.id);
    user.appStatus = 'Pending';
    user.appFeedback = `Trainer application submitted: ${experience} years experience, specialty in ${specialty}.`;
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
