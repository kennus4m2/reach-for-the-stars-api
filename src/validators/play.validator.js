const { body, param, query } = require('express-validator');
const { codeParam } = require('./session.validator');

const wholeNumber = (field) => body(field).exists().withMessage(`${field} is required`).bail()
  .isInt({ min: 1 }).withMessage(`${field} must be a positive whole number`).toInt();

module.exports = {
  codeRules: [codeParam],
  answerRules: [codeParam, wholeNumber('question_id'), wholeNumber('choice_id')],
  chestRules: [codeParam, param('offerId').isInt({ min: 1 }).withMessage('offerId must be a positive whole number').toInt(),
    body('slot').exists().withMessage('slot is required').bail().isInt({ min: 1, max: 3 }).withMessage('slot must be 1, 2 or 3').toInt()],
  leaderboardRules: [codeParam, query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1 to 50').toInt()],
};