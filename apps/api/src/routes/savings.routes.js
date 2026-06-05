const router = require('express').Router();
const ctrl = require('../controllers/savings.controller');
const { validate } = require('../middleware/validate');
const v = require('../validations/savings.validation');

router.get('/', ctrl.listGoals);
router.post('/', validate(v.createGoal), ctrl.createGoal);
router.get('/:id', ctrl.getGoal);
router.patch('/:id', validate(v.updateGoal), ctrl.updateGoal);
router.delete('/:id', ctrl.deleteGoal);
router.post('/:id/deposit', validate(v.addToGoal), ctrl.deposit); // tap a goal → deposit
module.exports = router;
