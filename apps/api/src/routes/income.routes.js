const router = require('express').Router();
const ctrl = require('../controllers/income.controller');
const { validate, validateQuery } = require('../middleware/validate');
const v = require('../validations/income.validation');

router.get('/summary', ctrl.summary);
router.get('/', validateQuery(v.listIncome), ctrl.list);
router.post('/', validate(v.logIncome), ctrl.log);
router.get('/:id', ctrl.getOne);
router.patch('/:id', validate(v.updateIncome), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
