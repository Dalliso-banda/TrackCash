const db = require('../config/db');
const { success, error, paginated } = require('../utils/response');

const create = async (req, res, next) => {
  try {
    const { amount, category, note, recorded_at } = req.body;
    const [id] = await db('expenses').insert({
      user_id: req.user.id,
      amount,
      category,
      note: note || null,
      recorded_at,
    });
    const expense = await db('expenses').where({ id }).first();
    return success(res, { expense }, 'Expense recorded', 201);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { page, limit, category, from, to } = req.query;
    const offset = (page - 1) * limit;

    let query = db('expenses').where({ user_id: req.user.id });
    if (category) query = query.where({ category });
    if (from) query = query.where('recorded_at', '>=', from);
    if (to) query = query.where('recorded_at', '<=', to);

    const [{ count }] = await query.clone().count('id as count');
    const total = Number(count);

    const expenses = await query
      .orderBy('recorded_at', 'desc')
      .limit(limit)
      .offset(offset);

    return paginated(res, expenses, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const expense = await db('expenses')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!expense) return error(res, 'Expense not found', 404);
    return success(res, { expense });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const expense = await db('expenses')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!expense) return error(res, 'Expense not found', 404);

    await db('expenses').where({ id: req.params.id }).update(req.body);
    const updated = await db('expenses').where({ id: req.params.id }).first();
    return success(res, { expense: updated }, 'Expense updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const expense = await db('expenses')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!expense) return error(res, 'Expense not found', 404);

    await db('expenses').where({ id: req.params.id }).delete();
    return success(res, null, 'Expense deleted');
  } catch (err) {
    next(err);
  }
};

// Breakdown by category for a given month
const summary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    const rows = await db('expenses')
      .where({ user_id: req.user.id })
      .whereRaw('MONTH(recorded_at) = ? AND YEAR(recorded_at) = ?', [m, y])
      .groupBy('category')
      .select('category')
      .sum('amount as total');

    const grandTotal = rows.reduce((acc, r) => acc + Number(r.total), 0);
    return success(res, { month: m, year: y, total: grandTotal, breakdown: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, update, remove, summary };
