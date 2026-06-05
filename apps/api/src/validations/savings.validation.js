const Joi = require('joi');

const createGoal = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  target_amount: Joi.number().positive().precision(2).required(),
  icon: Joi.string().max(50).optional().default('piggy-bank'),
  deadline: Joi.date().iso().optional(),
});

const updateGoal = Joi.object({
  title: Joi.string().min(2).max(100),
  target_amount: Joi.number().positive().precision(2),
  icon: Joi.string().max(50),
  deadline: Joi.date().iso(),
}).min(1);

const addToGoal = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  note: Joi.string().max(255).optional().allow(''),
});

module.exports = { createGoal, updateGoal, addToGoal };
