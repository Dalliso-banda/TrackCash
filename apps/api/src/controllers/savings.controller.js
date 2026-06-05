const db = require('../config/db');
const { success, error } = require('../utils/response');

const createGoal = async (req, res, next) => {
  try {
    const { title, target_amount, icon, deadline } = req.body;
    const [id] = await db('savings_goals').insert({
      user_id: req.user.id,
      title,
      target_amount,
      saved_amount: 0,
      icon,
      deadline: deadline || null,
    });
    const goal = await db('savings_goals').where({ id }).first();
    return success(res, { goal }, 'Savings goal created', 201);
  } catch (err) {
    next(err);
  }
};

const listGoals = async (req, res, next) => {
  try {
    const goals = await db('savings_goals')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    return success(res, { goals });
  } catch (err) {
    next(err);
  }
};

const getGoal = async (req, res, next) => {
  try {
    const goal = await db('savings_goals')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!goal) return error(res, 'Goal not found', 404);

    const deposits = await db('savings_deposits')
      .where({ goal_id: req.params.id })
      .orderBy('created_at', 'desc');

    return success(res, { goal, deposits });
  } catch (err) {
    next(err);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const goal = await db('savings_goals')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!goal) return error(res, 'Goal not found', 404);

    await db('savings_goals').where({ id: req.params.id }).update(req.body);
    const updated = await db('savings_goals').where({ id: req.params.id }).first();
    return success(res, { goal: updated }, 'Goal updated');
  } catch (err) {
    next(err);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await db('savings_goals')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!goal) return error(res, 'Goal not found', 404);

    await db('savings_deposits').where({ goal_id: req.params.id }).delete();
    await db('savings_goals').where({ id: req.params.id }).delete();
    return success(res, null, 'Goal deleted');
  } catch (err) {
    next(err);
  }
};

// Deposit money into a goal — this is what tapping a goal card triggers
const deposit = async (req, res, next) => {
  try {
    const { amount, note } = req.body;

    const goal = await db('savings_goals')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!goal) return error(res, 'Goal not found', 404);

    const newSaved = Number(goal.saved_amount) + Number(amount);
    if (newSaved > Number(goal.target_amount)) {
      return error(res, `Deposit would exceed goal target of K ${goal.target_amount}`, 400);
    }

    await db.transaction(async (trx) => {
      await trx('savings_goals')
        .where({ id: req.params.id })
        .update({ saved_amount: newSaved });

      await trx('savings_deposits').insert({
        goal_id: req.params.id,
        user_id: req.user.id,
        amount,
        note: note || null,
      });
    });

    const updated = await db('savings_goals').where({ id: req.params.id }).first();
    return success(res, { goal: updated }, 'Deposit added to goal');
  } catch (err) {
    next(err);
  }
};

module.exports = { createGoal, listGoals, getGoal, updateGoal, deleteGoal, deposit };
