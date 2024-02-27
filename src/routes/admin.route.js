// Dependencies
const express = require('express');

// Controller
const adminController = require("../controllers/admin.controller");

// Module scaffolding
const adminRouter = express.Router();

// Get all users
adminRouter.get("/users", adminController.getAllUsers);
// Get user by id
adminRouter.get("/users/:id", adminController.getUserById);
// Update user by id
adminRouter.put("/users/:id", adminController.updateUserById);
// Delete user by id
adminRouter.delete("/users/:id", adminController.deleteUserById);

// Export module
module.exports = adminRouter;
