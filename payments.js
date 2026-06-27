const express = require('express');
const Stripe = require('stripe');
const { authGuard } = require('../middleware/auth');
const Booking = require('../models/Booking');
const ClassModel = require('../models/Class');
const User = require('../models/User');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-payment-intent', authGuard, async (req, res, next) => {
  try {
    const { classId } = req.body;
    const gymClass = await ClassModel.findById(classId);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(gymClass.price * 100),
      currency: 'usd',
      metadata: { classId: gymClass._id.toString(), userId: req.user.id }
    });
    res.json({ clientSecret: paymentIntent.client_secret, class: gymClass });
  } catch (error) {
    next(error);
  }
});

router.post('/confirm', authGuard, async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment is not completed.' });
    }
    const gymClass = await ClassModel.findById(paymentIntent.metadata.classId);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    const user = await User.findById(paymentIntent.metadata.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const booking = await Booking.create({
      userId: user._id,
      classId: gymClass._id,
      className: gymClass.name,
      trainerName: gymClass.trainer,
      price: gymClass.price,
      schedule: gymClass.schedule,
      transactionId: paymentIntent.id
    });
    gymClass.bookings += 1;
    await gymClass.save();
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
