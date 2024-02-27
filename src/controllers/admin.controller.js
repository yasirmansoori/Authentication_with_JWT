// Dependencies
const createError = require('http-errors');
const User = require('../models/user.model');
const { authSchemaUpdate } = require('../validations/user.validation');
require('dotenv').config('../../.env');

// Module scaffolding
const adminController = {};

// Get all users
adminController.getAllUsers = async (req, res, next) => {
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
adminController.getUserById = async (req, res, next) => {
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
adminController.updateUserById = async (req, res, next) => {
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
adminController.deleteUserById = async (req, res, next) => {
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

module.exports = adminController;

