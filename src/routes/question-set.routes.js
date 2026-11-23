const { Router } = require('express');
const controller = require('../controllers/question-set.controller');
const questionController = require('../controllers/question.controller');
const rules = require('../validators/question-set.validator');
const questionRules = require('../validators/question.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');
const uploadCover = require('../middlewares/upload-cover');

const router = Router();
router.use(requireUser('HOST', 'ADMIN'));

router.get('/', rules.listRules, validate, controller.list);
router.post('/', rules.createRules, validate, controller.create);
router.get('/:id', rules.readRules, validate, controller.get);
router.patch('/:id', rules.updateRules, validate, controller.update);
router.delete('/:id', rules.idRules, validate, controller.remove);
router.put('/:id/cover', rules.idRules, validate, uploadCover, controller.uploadCover);

router.get('/:id/questions', questionRules.listRules, validate, questionController.list);
router.post('/:id/questions', questionRules.createRules, validate, questionController.create);
router.patch('/:id/questions/:questionId', questionRules.updateRules, validate, questionController.update);
router.delete('/:id/questions/:questionId', questionRules.deleteRules, validate, questionController.remove);

module.exports = router;
