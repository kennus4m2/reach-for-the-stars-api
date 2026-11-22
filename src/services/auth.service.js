const userRepository = require('../repositories/user.repository');
const password = require('../security/password');
const token = require('../security/token');
const env = require('../config/env');
const { unauthorized } = require('../errors/app-error');

// Rule: everybody who registers is a PLAYER. Only an admin can promote.
async function register({ school_id, full_name, email, password: plain }) {
  const password_hash = await password.hash(plain);
  return userRepository.create({ school_id, full_name, email, role: 'PLAYER', password_hash });
}

// Rule: a wrong password and an unknown school ID give the SAME answer (no account enumeration).
async function login({ school_id, password: plain }) {
  const user = await userRepository.findForLogin(school_id);
  const ok = await password.matches(plain, user ? user.password_hash : null);
  if (!ok) throw unauthorized('The school ID or the password is wrong.', 'INVALID_CREDENTIALS');
  return { token: token.issue(user), token_type: 'Bearer', expires_in: env.jwt.expiresIn, user };
}

module.exports = { register, login };