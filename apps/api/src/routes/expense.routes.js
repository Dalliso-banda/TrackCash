const router = require('express').Router();
const ctrl = require('../controllers/expense.controller');
const { validate, validateQuery } = require('../middleware/validate');
const v = require('../validations/expense.validation');

router.get('/summary', ctrl.summary);
router.get('/', validateQuery(v.listExpenses), ctrl.list);
router.post('/', validate(v.createExpense), ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id', validate(v.updateExpense), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
