const Joi = require('joi');
const { CATEGORIES } = require('./expense.validation');

const createBudget = Joi.object({
  category: Joi.string().valid(...CATEGORIES).required(),
  amount: Joi.number().positive().precision(2).required(),
  month: Joi.number().integer().min(1).max(12).default(() => new Date().getMonth() + 1),
  year: Joi.number().integer().min(2000).max(2100).default(() => new Date().getFullYear()),
  note: Joi.string().max(255).optional().allow(''),
});

const updateBudget = Joi.object({
  category: Joi.string().valid(...CATEGORIES),
  amount: Joi.number().positive().precision(2),
  month: Joi.number().integer().min(1).max(12),
  year: Joi.number().integer().min(2000).max(2100),
  note: Joi.string().max(255).allow(''),
}).min(1);

const listBudgets = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional(),
});

module.exports = { createBudget, updateBudget, listBudgets };

const createItem = Joi.object({
  name: Joi.string().max(150).required(),
  price: Joi.number().positive().precision(2).required(),
  quantity: Joi.number().integer().min(1).default(1),
  note: Joi.string().max(255).optional().allow(''),
});

const updateItem = Joi.object({
  name: Joi.string().max(150),
  price: Joi.number().positive().precision(2),
  quantity: Joi.number().integer().min(1),
  purchased: Joi.boolean(),
  note: Joi.string().max(255).allow(''),
}).min(1);

module.exports = { createBudget, updateBudget, listBudgets, createItem, updateItem };
