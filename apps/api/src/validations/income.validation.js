const Joi = require('joi');

const INCOME_TYPES = ['daily_wage', 'contract', 'side_hustle', 'gift', 'other'];

const logIncome = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  type: Joi.string().valid(...INCOME_TYPES).required(),
  expected_amount: Joi.number().positive().precision(2).optional(),
  note: Joi.string().max(255).optional().allow(''),
  recorded_at: Joi.date().iso().default(() => new Date()),
});

const updateIncome = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid(...INCOME_TYPES),
  expected_amount: Joi.number().positive().precision(2),
  note: Joi.string().max(255).allow(''),
  recorded_at: Joi.date().iso(),
}).min(1);

const listIncome = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(20), // bump max to 1000
  type:  Joi.string().valid(...INCOME_TYPES).optional(),
  from:  Joi.date().iso().optional(),
  to:    Joi.date().iso().optional(),
});

module.exports = { logIncome, updateIncome, listIncome, INCOME_TYPES };
