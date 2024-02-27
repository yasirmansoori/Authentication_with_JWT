// Dependencies
const bcrypt = require('bcrypt');
const { authSchemaRegister, authSchemaLogin, authSchemaUpdate } = require('../validations/user.validation');
const { signAccessToken, signRefreshToken, verifyRefreshToken, invalidateRefreshToken } = require('../config/tokenGenerator')
const createError = require('http-errors');
const User = require('../models/user.model')
require('dotenv').config('../../.env');

// Module scaffolding
const userController = {};

// Admin routes

// Get all users
userController.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    // Send response
    const payload = {
      message: "All users",
      Total: users.length,
      data: users
    };

    res.status(200).json(payload)
  } catch (error) {
    next(error)
  }
};

// Get user by id
userController.getUserById = async (req, res, next) => {
  try {
    // Get user id from request params
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) throw createError.NotFound("User not found")

    // Send response
    const payload = {
      message: "User found",
      data: user
    };
    res.status(200).json(payload)
  }
  catch (error) {
    next(error)
  }
};

// Update user by id
userController.updateUserById = async (req, res, next) => {
  try {
    // Get user id from request params
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) throw createError.NotFound("User not found")

    // validate request body
    const result = await authSchemaUpdate.validateAsync(req.body);

    // Update user
    const updated = await User.findByIdAndUpdate(id, result, { new: true });

    // Send response
    const payload = {
      message: "User updated",
      data: updated
    };

    res.status(200).json(payload)
  } catch (error) {
    next(error)
  }
};

// Delete user by id
userController.deleteUserById = async (req, res, next) => {
  try {
    // Get user id from request params
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) throw createError.NotFound("User not found")

    // Delete user
    const deleted = await User.findByIdAndDelete(id);

    // Send response
    const payload = {
      message: "User deleted",
      data: deleted
    };

    res.status(200).json(payload)
  } catch (error) {
    next(error)
  }
};

// Register user controller
userController.register = async (req, res, next) => {
  try {
    // Check if email already exists
    const result = await authSchemaRegister.validateAsync(req.body)
    await User.findOne({ email: result.email }).then((user) => {
      if (user) throw createError.Conflict("This email has already an account. Please login")
    })

    // Hash password and register user
    result.password = await hashPassword(result.password);
    const user = new User(result)
    const savedUser = await user.save()

    // Generate tokens
    const accessToken = await signAccessToken(savedUser.id)
    const refreshToken = await signRefreshToken(savedUser.id)

    // Set cookies
    const date = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)// 1 day * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

    res.cookie('access_token', accessToken, { expires: date, httpOnly: true })
    res.cookie('refresh_token', refreshToken, { expires: date, httpOnly: true })

    // Send response
    const payload = {
      message: "User registered successfully",
      data: {
        _id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username,
        email: savedUser.email,
        accessToken,
        refreshToken
      }
    };
    res.status(201).send(payload)
  } catch (error) {
    // Unprocessable Entity, means the server understands the content type of the request entity, and the syntax of the request entity is correct, but it was unable to process the contained instructions.
    if (error.isJoi === true) error.status = 422
    next(error);
  }
};
// Login user controller
userController.login = async (req, res, next) => {
  try {
    const result = await authSchemaLogin.validateAsync(req.body)
    // Check if email exists
    const user = await User.findOne({ email: result.email })
    // If email not found
    if (!user) throw createError.NotFound("User not registered")

    // Check if password is valid
    const isMatch = await user.isValidPassword(result.password)
    if (!isMatch) throw createError.Unauthorized("Email/Password not valid")

    // Generate tokens
    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)

    // Set cookies
    const date = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)// 1 day * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    res.cookie('access_token', accessToken, { expires: date, httpOnly: false })
    res.cookie('refresh_token', refreshToken, { expires: date, httpOnly: false })

    // Send response
    const userDetails = {
      message: "User logged in successfully",
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        accessToken,
        refreshToken
      }
    };
    res.send(userDetails)
  } catch (error) {
    if (error.isJoi === true) return next(createError.BadRequest("Invalid Username/Password"))
    next(error)
  }
};
// Refresh token controller
userController.refreshToken = async (req, res, next) => {
  try {
    // Check if refresh token exists
    const { refresh_token } = req.cookies
    if (!refresh_token) throw createError.BadRequest()

    // Verify refresh token
    const userId = await verifyRefreshToken(refresh_token)

    // Generate new tokens
    const accessToken = await signAccessToken(userId)
    const refToken = await signRefreshToken(userId)

    // Set cookies
    const date = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    res.cookie('access_token', accessToken, { expires: date, httpOnly: true })
    res.cookie('refresh_token', refToken, { expires: date, httpOnly: true })

    // Send response
    res.send({ accessToken: accessToken, refreshToken: refToken })
  } catch (error) {
    next(error)
  }

}
// Logout user controller
userController.logout = async (req, res, next) => {
  try {
    // Check if refresh token exists
    const { refresh_token } = req.cookies
    if (!refresh_token) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refresh_token)
    invalidateRefreshToken(refresh_token);
    res.json({ message: "User logged out successfully" })
  } catch (error) {
    next(error)
  }
}

// Helper Function to hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Export module
module.exports = userController;

