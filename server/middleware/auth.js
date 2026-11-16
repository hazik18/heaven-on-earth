const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Local-only dev bypass: strictly requires development mode, explicit opt-in flag,
 * and no active MongoDB connection so production can never enter this path.
 */
const isDevAuthBypass = () =>
  process.env.NODE_ENV === 'development' &&
  process.env.DEV_AUTH_BYPASS === 'true' &&
  mongoose.connection.readyState !== 1;

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (isDevAuthBypass() && decoded.id === 'mock-admin-id') {
        req.user = {
          _id: 'mock-admin-id',
          name: 'Dev Admin',
          email: 'admin@kashmirtravels.com',
          role: 'admin'
        };
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { protect, adminOnly, admin: adminOnly, isDevAuthBypass };
