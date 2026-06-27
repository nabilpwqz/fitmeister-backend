const express = require('express');
const authRoutes = require('./auth');
const classRoutes = require('./classes');
const forumRoutes = require('./forum');
const adminRoutes = require('./admin');
const paymentRoutes = require('./payments');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/classes', classRoutes);
router.use('/forum', forumRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
module.exports = router;
