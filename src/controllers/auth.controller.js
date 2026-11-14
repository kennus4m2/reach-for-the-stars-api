const { matchedData } = require('express-validator');
const authService = require('../services/auth.service');

// The only place an account becomes JSON: the hash is never listed here.
const toJson = (u) => ({ user_id: u.user_id, school_id: u.school_id, full_name: u.full_name, email: u.email, role: u.role, created_at: u.created_at });

async function register(req, res) {
  res.status(201).json({ user: toJson(await authService.register(matchedData(req))) });
}
async function login(req, res) {
  const result = await authService.login(matchedData(req));
  res.json({ ...result, user: toJson(result.user) });
}
async function me(req, res) {
  res.json({ user: toJson(req.account) });
}

module.exports = { register, login, me, toJson };