const bcrypt = require('bcryptjs');
const db = require('../config/db');
const env = require('../config/env');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { name, email, password, currency, monthly_income_goal } = req.body;

    const existing = await db('users').where({ email }).first();
    if (existing) return error(res, 'Email already in use', 409);

    const password_hash = await bcrypt.hash(password, Number(env.BCRYPT_ROUNDS));

    const [id] = await db('users').insert({
      name,
      email,
      password_hash,
      currency,
      monthly_income_goal: monthly_income_goal || null,
    });

    const user = { id, name, email, currency };
    const access_token = signAccessToken({ id });
    const refresh_token = signRefreshToken({ id });

    logger.info(`New user registered: ${email}`);
    return success(res, { user, access_token, refresh_token }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) return error(res, 'Invalid email or password', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return error(res, 'Invalid email or password', 401);

    const access_token = signAccessToken({ id: user.id });
    const refresh_token = signRefreshToken({ id: user.id });

    const { password_hash, ...safeUser } = user;
    return success(res, { user: safeUser, access_token, refresh_token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const decoded = verifyRefreshToken(refresh_token);

    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) return error(res, 'User not found', 401);

    const access_token = signAccessToken({ id: user.id });
    return success(res, { access_token }, 'Token refreshed');
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Refresh token expired, please login again', 401);
    next(err);
  }
};
const updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'currency', 'monthly_income_goal'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    if (Object.keys(updates).length === 0)
      return error(res, 'No valid fields to update', 400);

    await db('users').where({ id: req.user.id }).update(updates);
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'name', 'email', 'currency', 'monthly_income_goal')
      .first();
    return success(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'name', 'email', 'currency', 'monthly_income_goal', 'created_at')
      .first();
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await db('users').where({ id: req.user.id }).first();

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return error(res, 'Current password is incorrect', 400);

    const password_hash = await bcrypt.hash(new_password, Number(env.BCRYPT_ROUNDS));
    await db('users').where({ id: req.user.id }).update({ password_hash });

    return success(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, me, changePassword,updateMe };
