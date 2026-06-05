const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const v = require('../validations/auth.validation');

router.post('/register', validate(v.register), ctrl.register);
router.post('/login', validate(v.login), ctrl.login);
router.post('/refresh', validate(v.refreshToken), ctrl.refresh);

router.patch('/change-password', protect, validate(v.changePassword), ctrl.changePassword);

router.route('/me')
  .get(protect, ctrl.me)
  .patch(protect, ctrl.updateMe);
module.exports = router;
