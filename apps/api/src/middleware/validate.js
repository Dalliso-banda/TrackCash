const { error } = require('../utils/response');

/**
 * Validate req.body against a Joi schema
 */
const validate = (schema) => (req, res, next) => {
  const { error: joiError, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (joiError) {
    const errors = joiError.details.map((d) => ({
      field: d.context.key,
      message: d.message.replace(/['"]/g, ''),
    }));
    return error(res, 'Validation failed', 422, errors);
  }

  req.body = value;
  next();
};

/**
 * Validate req.query against a Joi schema
 */
const validateQuery = (schema) => (req, res, next) => {
  const { error: joiError, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,  
  });

  if (joiError) {
    const errors = joiError.details.map((d) => ({
      field: d.context.key,
      message: d.message.replace(/['"]/g, ''),
    }));
    return error(res, 'Invalid query parameters', 422, errors);
  }

  req.query = value;
  next();
};

module.exports = { validate, validateQuery };
