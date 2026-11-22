const { Router } = require('express');
const controller = require('../controllers/user.controller');
const rules = require('../validators/auth.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

const router = Router();
router.use(requireUser('ADMIN'));          // the guard runs first: strangers learn nothing about our rules

router.get('/', controller.list);
router.patch('/:id/role', rules.roleRules, validate, controller.changeRole);

module.exports = router;