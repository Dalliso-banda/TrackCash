const db = require('../config/db');
const { success, error, paginated } = require('../utils/response');

const log = async (req, res, next) => {
  try {
    const { amount, type, expected_amount, note, recorded_at } = req.body;
    const [id] = await db('income').insert({
      user_id: req.user.id,
      amount,
      type,
      expected_amount: expected_amount || null,
      note: note || null,
      recorded_at,
    });
    const entry = await db('income').where({ id }).first();
    return success(res, { income: entry }, 'Income logged', 201);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const { page, limit, type, from, to } = req.query;
    const offset = (page - 1) * limit;

    let query = db('income').where({ user_id: req.user.id });
    if (type) query = query.where({ type });
    if (from) query = query.where('recorded_at', '>=', from);
    if (to) query = query.where('recorded_at', '<=', to);

    const [{ count }] = await query.clone().count('id as count');
    const total = Number(count);

    const rows = await query.orderBy('recorded_at', 'desc').limit(limit).offset(offset);

    return paginated(res, rows, {
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
    const entry = await db('income')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!entry) return error(res, 'Income entry not found', 404);
    return success(res, { income: entry });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const entry = await db('income')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!entry) return error(res, 'Income entry not found', 404);

    await db('income').where({ id: req.params.id }).update(req.body);
    const updated = await db('income').where({ id: req.params.id }).first();
    return success(res, { income: updated }, 'Income entry updated');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const entry = await db('income')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    if (!entry) return error(res, 'Income entry not found', 404);

    await db('income').where({ id: req.params.id }).delete();
    return success(res, null, 'Income entry deleted');
  } catch (err) {
    next(err);
  }
};

const summary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    const rows = await db('income')
      .where({ user_id: req.user.id })
      .whereRaw('MONTH(recorded_at) = ? AND YEAR(recorded_at) = ?', [m, y])
      .groupBy('type')
      .select('type')
      .sum('amount as total')
      .sum('expected_amount as expected_total');

    const grandTotal = rows.reduce((acc, r) => acc + Number(r.total), 0);
    const grandExpected = rows.reduce((acc, r) => acc + Number(r.expected_total || 0), 0);

    return success(res, {
      month: m,
      year: y,
      total: grandTotal,
      expected_total: grandExpected,
      variance: grandTotal - grandExpected,
      breakdown: rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { log, list, getOne, update, remove, summary };
