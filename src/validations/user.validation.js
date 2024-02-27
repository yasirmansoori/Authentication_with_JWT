const Joi = require('joi');

// Register validation schema
const authSchemaRegister = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().min(3).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required(),
  role: Joi.string().valid('admin', 'user').default('user')
})

// Login validation schema
const authSchemaLogin = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(2).required()
})

// update user validation schema (admin)
const authSchemaUpdate = Joi.object({
  name: Joi.string(),
  username: Joi.string().min(3),
  email: Joi.string().email().lowercase(),
  role: Joi.string().valid('admin', 'user').default('user')
})

module.exports = { authSchemaRegister, authSchemaLogin , authSchemaUpdate}