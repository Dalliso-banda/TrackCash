const router = require('express').Router();
const ctrl = require('../controllers/budget.controller');
const { validate, validateQuery } = require('../middleware/validate');
const v = require('../validations/budget.validation');

router.get('/', validateQuery(v.listBudgets), ctrl.list);
router.post('/', validate(v.createBudget), ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id', validate(v.updateBudget), ctrl.update);
router.delete('/:id', ctrl.remove);

// Budget items
router.get('/:id/items', ctrl.listItems);
router.post('/:id/items', validate(v.createItem), ctrl.createItem);
router.patch('/:id/items/:itemId', validate(v.updateItem), ctrl.updateItem);
router.delete('/:id/items/:itemId', ctrl.removeItem);

module.exports = router;
