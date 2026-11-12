const { body, param } = require('express-validator');

// Hub Contract rule 5: a join code is six digits and does not start with 0.
const codeParam = param('code').matches(/^[1-9][0-9]{5}$/).withMessage('the join code must be six digits');

const createRules = [
  body('question_set_id').exists().withMessage('question_set_id is required').bail()
    .isInt({ min: 1 }).withMessage('question_set_id must be a positive whole number').toInt(),
  body('duration_sec').optional()
    .isInt({ min: 30, max: 3600 }).withMessage('duration_sec must be a whole number from 30 to 3600').toInt(),
];
const statusRules = [
  codeParam,
  body('status').isIn(['ACTIVE', 'ENDED']).withMessage('status must be ACTIVE or ENDED'),
];
const joinRules = [
  codeParam,
  body('nickname')                                        // nickname VARCHAR(50); we allow 2 to 20
    .exists().withMessage('nickname is required').bail()
    .isString().withMessage('nickname must be text').bail().trim()
    .isLength({ min: 2, max: 20 }).withMessage('nickname must be 2 to 20 characters'),
];

module.exports = { codeParam, createRules, statusRules, joinRules };