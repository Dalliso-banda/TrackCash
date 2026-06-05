const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  currency: Joi.string().valid('ZMW', 'USD', 'ZAR', 'KES').default('ZMW'),
  monthly_income_goal: Joi.number().positive().optional(),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshToken = Joi.object({
  refresh_token: Joi.string().required(),
});

const changePassword = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(8).required(),
});

module.exports = { register, login, refreshToken, changePassword };
