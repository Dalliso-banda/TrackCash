const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { overview } = require('../controllers/dashboard.controller');

router.use('/auth', require('./auth.routes'));
router.use('/expenses', protect, require('./expense.routes'));
router.use('/income', protect, require('./income.routes'));
router.use('/savings', protect, require('./savings.routes'));
router.get('/dashboard', protect, overview);

module.exports = router;
