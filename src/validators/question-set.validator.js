const { body, param } = require('express-validator');

const idParam = param('id').isInt({ min: 1 }).withMessage('id must be a positive whole number').toInt();

// text(name, ...) follows the data dictionary: type, length, required or optional
const text = (name, { max, min = 1, required = false }) => {
  let chain = body(name);
  chain = required ? chain.exists().withMessage(`${name} is required`).bail() : chain.optional({ values: 'null' });
  return chain.isString().withMessage(`${name} must be text`).bail().trim()
    .isLength({ min, max }).withMessage(`${name} must be ${min} to ${max} characters`);
};
const fields = (required) => [
  text('title', { min: 3, max: 255, required }),          // title VARCHAR(255) NOT NULL; min 3 is our own rule
  text('description', { min: 0, max: 1000 }),             // TEXT, we limit it to 1000
  text('subject', { min: 0, max: 100 }),                  // VARCHAR(100)
  text('grade_level', { min: 0, max: 50 }),               // VARCHAR(50)
];
const atLeastOne = body().custom((b) => ['title', 'description', 'subject', 'grade_level'].some((k) => b && b[k] !== undefined))
  .withMessage('send at least one of: title, description, subject, grade_level');

module.exports = {
  idRules: [idParam],
  createRules: fields(true),
  updateRules: [idParam, atLeastOne, ...fields(false)],
};