'use strict';

const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'HO', 'SPV', 'User').default('User'),
  roadAssignment: Joi.string().allow('').optional(),
  mobile: Joi.string().allow('').optional(),
  manager: Joi.string().allow('').optional(),
  designation: Joi.string().allow('').optional(),
  jobDescription: Joi.string().allow('').optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

module.exports = { loginSchema, registerSchema, changePasswordSchema };
