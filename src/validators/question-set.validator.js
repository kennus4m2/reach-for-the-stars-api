const { body, param, query } = require('express-validator');
const { pageRules, sortRules } = require('./list.validator');

const idParam = param('id').isInt({ min: 1 }).withMessage('id must be a positive whole number').toInt();

const text = (name, { max, min = 1, required = false }) => {
  let chain = body(name);
  chain = required ? chain.exists().withMessage(`${name} is required`).bail() : chain.optional({ values: 'null' });
  return chain.isString().withMessage(`${name} must be text`).bail().trim()
    .isLength({ min, max }).withMessage(`${name} must be ${min} to ${max} characters`);
};
const fields = (required) => [
  text('title', { min: 3, max: 255, required }),
  text('description', { min: 0, max: 1000 }),
  text('subject', { min: 0, max: 100 }),
  text('grade_level', { min: 0, max: 50 }),
];
const atLeastOne = body().custom((b) => ['title', 'description', 'subject', 'grade_level'].some((k) => b && b[k] !== undefined))
  .withMessage('send at least one of: title, description, subject, grade_level');

module.exports = {
  idRules: [idParam],
  listRules: [...pageRules, ...sortRules(['id', 'title', 'created_at']), query('q').optional().isString().trim().isLength({ max: 100 }).withMessage('q must be at most 100 characters')],
  readRules: [idParam, query('include').optional().isIn(['questions']).withMessage('include must be questions')],
  createRules: fields(true),
  updateRules: [idParam, atLeastOne, ...fields(false)],
};