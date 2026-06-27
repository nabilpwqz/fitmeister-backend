const express = require('express');
const User = require('../models/User');
const ClassModel = require('../models/Class');
const Booking = require('../models/Booking');
const ForumPost = require('../models/ForumPost');
const { authGuard, roleGuard } = require('../middleware/auth');

const router = express.Router();
router.use(authGuard, roleGuard(['admin']));

router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClasses = await ClassModel.countDocuments();
    const totalBookings = await Booking.countDocuments();
    res.json({ totalUsers, totalClasses, totalBookings });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/block', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.status = user.status === 'Blocked' ? 'Active' : 'Blocked';
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'trainer', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.role = role;
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/applications', async (req, res, next) => {
  try {
    const applications = await User.find({ appStatus: 'Pending' }).select('-password');
    res.json({ applications });
  } catch (error) {
    next(error);
  }
});

router.put('/applications/:id/approve', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.role = 'trainer';
    user.appStatus = 'Approved';
    user.appFeedback = '';
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put('/applications/:id/reject', async (req, res, next) => {
  try {
    const { feedback } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.appStatus = 'Rejected';
    user.appFeedback = feedback || 'Your application has been rejected by the admin.';
    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/trainers', async (req, res, next) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('-password');
    res.json({ trainers });
  } catch (error) {
    next(error);
  }
});

router.get('/classes', async (req, res, next) => {
  try {
    const classes = await ClassModel.find().sort({ createdAt: -1 });
    res.json({ classes });
  } catch (error) {
    next(error);
  }
});

router.put('/classes/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    const gymClass = await ClassModel.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    gymClass.status = status;
    await gymClass.save();
    res.json({ class: gymClass });
  } catch (error) {
    next(error);
  }
});

router.delete('/classes/:id', async (req, res, next) => {
  try {
    const gymClass = await ClassModel.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    await gymClass.deleteOne();
    res.json({ message: 'Class deleted.' });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const transactions = await Booking.find().sort({ paidAt: -1 });
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

router.get('/forum-posts', async (req, res, next) => {
  try {
    const posts = await ForumPost.find().sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
