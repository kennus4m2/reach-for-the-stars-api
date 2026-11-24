const { Router } = require('express');
const sessionController = require('../controllers/session.controller');
const playerController = require('../controllers/player.controller');
const playController = require('../controllers/play.controller');
const rules = require('../validators/session.validator');
const playRules = require('../validators/play.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

const router = Router();

router.post('/', requireUser('HOST', 'ADMIN'), rules.createRules, validate, sessionController.create);
router.get('/:code', rules.codeParam, validate, sessionController.get);
router.patch('/:code', requireUser('HOST', 'ADMIN'), rules.statusRules, validate, sessionController.changeStatus);

router.post('/:code/players', requireUser(), rules.joinRules, validate, playerController.join);
router.get('/:code/players', rules.codeParam, validate, playerController.list);

// Week 13: the game itself
router.get('/:code/question', requireUser(), playRules.codeRules, validate, playController.question);
router.post('/:code/answers', requireUser(), playRules.answerRules, validate, playController.answer);
router.post('/:code/chests/:offerId/open', requireUser(), playRules.chestRules, validate, playController.openChest);
router.get('/:code/leaderboard', playRules.leaderboardRules, validate, playController.leaderboard);
router.get('/', requireUser('HOST', 'ADMIN'), rules.listRules, validate, sessionController.list);
router.get('/:code/players/me', requireUser(), playRules.codeRules, validate, playController.me);

module.exports = router;
