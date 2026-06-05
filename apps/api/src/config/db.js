const knex = require('knex');
const env = require('./env');
const knexfile = require('./knexfile');
const logger = require('../utils/logger');

const config = knexfile[env.NODE_ENV] || knexfile.development;
const db = knex(config);

db.raw('SELECT 1')
  .then(() => logger.info('MySQL connected successfully'))
  .catch((err) => {
    logger.error(`MySQL connection failed: ${err.message}`);
    process.exit(1);
  });

module.exports = db;
