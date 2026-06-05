const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const db = require('../config/db');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) return error(res, 'User not found', 401);

    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Token expired', 401);
    if (err.name === 'JsonWebTokenError') return error(res, 'Invalid token', 401);
    return error(res, 'Authentication failed', 401);
  }
};

module.exports = { protect };
