// src/routes/index.js, final order (Week 12 to 15). Only the middle block is new each week.
const { Router } = require('express');
const currentUser = require('../middlewares/current-user');

const router = Router();
// 1) Public Hub endpoints: before currentUser
router.use('/health', require('./health.routes'));
router.use('/game-info', require('./game-info.routes'));
router.use('/results', require('./results.routes'));
router.use(require('./docs.routes'));                       // Week 15: Swagger UI

// 2) Everything below knows who is calling (Bearer token)
router.use(currentUser);
router.use('/auth', require('./auth.routes'));              // Week 12
router.use('/users', require('./user.routes'));             // Week 12
router.use('/question-sets', require('./question-set.routes'));
router.use('/sessions', require('./session.routes'));

module.exports = router;