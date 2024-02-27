// Dependencies
const createError = require('http-errors');
const User = require('../models/user.model');

// User role based authentication
const auth = async (req, res, next) => {
  try {
    // Get userId from protect middleware
    const { userId } = req.user;

    // Check user role by finding user from database
    const user = await User.findById(userId);

    // Check user role
    if (user.role !== 'admin') {
      return next(createError.Unauthorized('You are not authorized to access this route'));
    }
    next();
  } catch (error) {
    return next(createError.Unauthorized('You are not authenticated'));
  }
};

// Export module
module.exports = auth;