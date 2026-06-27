const express = require('express');
const ClassModel = require('../models/Class');
const User = require('../models/User');
const { authGuard, roleGuard } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category, page = 1, limit = 10 } = req.query;
    const filter = { status: 'Approved' };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = { $in: category.split(',') };
    const skip = (Number(page) - 1) * Number(limit);
    const total = await ClassModel.countDocuments(filter);
    const classes = await ClassModel.find(filter).skip(skip).limit(Number(limit)).sort({ bookings: -1 });
    res.json({ classes, page: Number(page), total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const gymClass = await ClassModel.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    res.json({ class: gymClass });
  } catch (error) {
    next(error);
  }
});

router.post('/', authGuard, roleGuard(['trainer', 'admin']), async (req, res, next) => {
  try {
    const newClass = await ClassModel.create({ ...req.body, createdBy: req.user.id, status: 'Pending' });
    res.status(201).json({ class: newClass });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authGuard, roleGuard(['trainer', 'admin']), async (req, res, next) => {
  try {
    const gymClass = await ClassModel.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    if (req.user.role === 'trainer' && String(gymClass.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to edit this class.' });
    }
    Object.assign(gymClass, req.body);
    await gymClass.save();
    res.json({ class: gymClass });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authGuard, roleGuard(['trainer', 'admin']), async (req, res, next) => {
  try {
    const gymClass = await ClassModel.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    if (req.user.role === 'trainer' && String(gymClass.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this class.' });
    }
    await gymClass.deleteOne();
    res.json({ message: 'Class deleted.' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/favorite', authGuard, async (req, res, next) => {
  try {
    const gymClass = await ClassModel.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ message: 'Class not found.' });
    const user = await User.findById(req.user.id);
    const exists = user.favorites.some((fav) => String(fav) === String(gymClass._id));
    if (exists) {
      user.favorites = user.favorites.filter((fav) => String(fav) !== String(gymClass._id));
    } else {
      user.favorites.push(gymClass._id);
    }
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
