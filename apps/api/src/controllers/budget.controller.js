const db = require('../config/db');
const { success, error } = require('../utils/response');

const normalizeBudget = (budget, expenseMap) => {
  const amount = Number(budget.amount);
  const spent = Number(expenseMap[budget.category] || 0);
  const remaining = amount - spent;
  const percentage = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;

  return {
    ...budget,
    amount,
    spent,
    remaining,
    percentage,
  };
};

const create = async (req, res, next) => {
  try {
    const { category, amount, month, year, note } = req.body;

    const existing = await db('budgets')
      .where({ user_id: req.user.id, category, month, year })
      .first();

    if (existing) {
      return error(res, 'Budget already exists for that category and month', 409);
    }

    const [id] = await db('budgets').insert({
      user_id: req.user.id,
      category,
      amount,
      month,
      year,
      note: note || null,
    });

    const budget = await db('budgets').where({ id }).first();
    return success(res, { budget }, 'Budget created', 201);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());

    const budgets = await db('budgets')
      .where({ user_id: req.user.id, month, year })
      .orderBy('category');

    const expenseRows = await db('expenses')
      .where({ user_id: req.user.id })
      .whereRaw('MONTH(recorded_at) = ? AND YEAR(recorded_at) = ?', [month, year])
      .select('category')
      .sum('amount as total')
      .groupBy('category');

    const expenseMap = Object.fromEntries(
      expenseRows.map((row) => [row.category, Number(row.total || 0)])
    );

    const normalizedBudgets = budgets.map((budget) => normalizeBudget(budget, expenseMap));
    const totalBudget = normalizedBudgets.reduce((acc, row) => acc + row.amount, 0);
    const totalSpent = normalizedBudgets.reduce((acc, row) => acc + row.spent, 0);

    return success(res, {
      month,
      year,
      summary: {
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining: totalBudget - totalSpent,
      },
      budgets: normalizedBudgets,
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const budget = await db('budgets')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!budget) return error(res, 'Budget entry not found', 404);

    return success(res, { budget });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const budget = await db('budgets')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!budget) return error(res, 'Budget entry not found', 404);

    await db('budgets').where({ id: req.params.id }).update(req.body);
    const updated = await db('budgets').where({ id: req.params.id }).first();
    return success(res, { budget: updated }, 'Budget updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const budget = await db('budgets')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!budget) return error(res, 'Budget entry not found', 404);

    await db('budgets').where({ id: req.params.id }).delete();
    return success(res, null, 'Budget deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, update, remove };

// -- Budget items handlers
const listItems = async (req, res, next) => {
  try {
    const budgetId = req.params.id;
    const items = await db('budget_items').where({ budget_id: budgetId, user_id: req.user.id }).orderBy('created_at', 'asc');
    return success(res, { items });
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const budgetId = req.params.id;
    const { name, price, quantity, note } = req.body;
    const budget = await db('budgets').where({ id: budgetId, user_id: req.user.id }).first();
    if (!budget) return error(res, 'Budget not found', 404);

    const [id] = await db('budget_items').insert({
      budget_id: budgetId,
      user_id: req.user.id,
      name,
      price,
      quantity: quantity || 1,
      note: note || null,
    });

    const item = await db('budget_items').where({ id }).first();
    return success(res, { item }, 'Item created', 201);
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const item = await db('budget_items').where({ id: itemId, budget_id: id, user_id: req.user.id }).first();
    if (!item) return error(res, 'Item not found', 404);

    await db('budget_items').where({ id: itemId }).update(req.body);
    const updated = await db('budget_items').where({ id: itemId }).first();
    return success(res, { item: updated }, 'Item updated');
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const item = await db('budget_items').where({ id: itemId, budget_id: id, user_id: req.user.id }).first();
    if (!item) return error(res, 'Item not found', 404);

    await db('budget_items').where({ id: itemId }).delete();
    return success(res, null, 'Item deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, update, remove, listItems, createItem, updateItem, removeItem };
