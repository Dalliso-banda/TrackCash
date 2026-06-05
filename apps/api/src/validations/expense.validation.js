const Joi = require('joi');

const CATEGORIES = ['food', 'home', 'phone', 'transport', 'savings', 'miscellaneous'];

const createExpense = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  note: Joi.string().max(255).optional().allow(''),
  recorded_at: Joi.date().iso().default(() => new Date()),
});

const updateExpense = Joi.object({
  amount: Joi.number().positive().precision(2),
  category: Joi.string().valid(...CATEGORIES),
  note: Joi.string().max(255).allow(''),
  recorded_at: Joi.date().iso(),
}).min(1);

const listExpenses = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(1000).default(20), // also bump max to 1000
  category: Joi.string().valid(...CATEGORIES).optional(),
  from:     Joi.date().iso().optional(),
  to:       Joi.date().iso().optional(),
});

module.exports = { createExpense, updateExpense, listExpenses, CATEGORIES };
