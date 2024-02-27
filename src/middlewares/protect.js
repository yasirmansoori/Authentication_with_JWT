// Dependencies
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

// Module scaffolding
const protect = async (req, res, next) => {
  // Get Token from cookies
  const token = req.cookies.access_token;

  // Check token is valid 
  if (!token) {
    return next(createError.Unauthorized('You are not authenticated'));
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = {
      userId: decoded.aud,
    };
    next();
  } catch (error) {
    return next(createError.Unauthorized('You are not authenticated'));
  }
};

// Export module
module.exports = protect;