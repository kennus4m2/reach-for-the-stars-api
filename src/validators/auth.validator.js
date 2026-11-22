const { body, param } = require('express-validator');

const schoolId = body('school_id').exists().withMessage('school_id is required').bail()
  .isString().withMessage('school_id must be text').bail().trim()
  .matches(/^\d{4}-\d{4}$/).withMessage('school_id looks like 2099-1001');

const registerRules = [
  schoolId,
  body('full_name').exists().withMessage('full_name is required').bail()
    .isString().withMessage('full_name must be text').bail().trim()
    .isLength({ min: 2, max: 100 }).withMessage('full_name must be 2 to 100 characters'),
  body('email').exists().withMessage('email is required').bail()
    .isString().bail().trim().toLowerCase()
    .isEmail().withMessage('email must be a valid address').isLength({ max: 100 }).withMessage('email must be at most 100 characters'),
  body('password').exists().withMessage('password is required').bail()
    .isString().withMessage('password must be text').bail()
    .isLength({ min: 8, max: 72 }).withMessage('password must be 8 to 72 characters')   // bcrypt reads 72 bytes
    .matches(/[A-Za-z]/).withMessage('password needs a letter')
    .matches(/\d/).withMessage('password needs a number'),
  // no rule for "role": matchedData drops it, so a client can never choose its role
];
// Login checks only that the two fields exist: format rules would tell strangers what a valid ID looks like.
const loginRules = [
  body('school_id').exists().withMessage('school_id is required').bail().isString().withMessage('school_id must be text'),
  body('password').exists().withMessage('password is required').bail().isString().withMessage('password must be text'),
];
const roleRules = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive whole number').toInt(),
  body('role').isIn(['PLAYER', 'HOST', 'ADMIN']).withMessage('role must be PLAYER, HOST or ADMIN'),
];

module.exports = { registerRules, loginRules, roleRules };