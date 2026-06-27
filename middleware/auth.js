const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authGuard = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization token missing.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token.' });
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      appStatus: user.appStatus,
      appFeedback: user.appFeedback,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const blockedGuard = (req, res, next) => {
  if (req.user.status === 'Blocked') {
    return res.status(403).json({ message: 'Action restricted by Admin. Contact support for access.' });
  }
  next();
};

const roleGuard = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: insufficient privileges.' });
    next();
  };
};

module.exports = { authGuard, roleGuard, blockedGuard };
