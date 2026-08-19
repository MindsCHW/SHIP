'use strict';

/**
 * Joi validation middleware factory.
 * Validates req.body against the provided schema.
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} target - 'body' | 'query' | 'params' (default: 'body')
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Replace request data with sanitized value
    req[target] = value;
    next();
  };
};

module.exports = { validate };
