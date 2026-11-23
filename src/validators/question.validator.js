const { body, param } = require('express-validator');

const setParam = param('id').isInt({ min: 1 }).withMessage('id must be a positive whole number').toInt();
const questionParam = param('questionId').isInt({ min: 1 }).withMessage('questionId must be a positive whole number').toInt();

const fields = (required) => {
  const text = body('text');
  const choices = body('choices');
  return [
    (required ? text.exists().withMessage('text is required').bail() : text.optional())
      .isString().withMessage('text must be text').bail().trim().isLength({ min: 3, max: 500 }).withMessage('text must be 3 to 500 characters'),
    body('time_limit_sec').optional().isInt({ min: 5, max: 120 }).withMessage('time_limit_sec must be 5 to 120').toInt(),
    (required ? choices.exists().withMessage('choices is required').bail() : choices.optional())
      .isArray({ min: 2, max: 4 }).withMessage('choices must be a list of 2 to 4 items'),
    body('choices.*.text').isString().withMessage('each choice needs text').bail().trim().isLength({ min: 1, max: 200 }).withMessage('choice text must be 1 to 200 characters'),
    body('choices.*.is_correct').isBoolean({ strict: true }).withMessage('is_correct must be true or false'),
    // exactly one correct choice
    choices.custom((list) => !Array.isArray(list) || list.filter((c) => c && c.is_correct === true).length === 1)
      .withMessage('exactly one choice must be correct'),
  ];
};

module.exports = {
  listRules: [setParam],
  createRules: [setParam, ...fields(true)],
  updateRules: [setParam, questionParam, ...fields(false)],
  deleteRules: [setParam, questionParam],
};