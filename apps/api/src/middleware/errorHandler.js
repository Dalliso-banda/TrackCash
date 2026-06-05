const logger = require('../utils/logger');
const { error } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} — ${req.method} ${req.originalUrl}`, { stack: err.stack });

  // Knex / MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'A record with that value already exists', 409);
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return error(res, 'Referenced record not found', 400);
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message;

  return error(res, message, statusCode);
};

const notFound = (req, res) => {
  return error(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFound };
