const { matchedData } = require('express-validator');
const userService = require('../services/user.service');
const { toJson } = require('./auth.controller');

async function list(req, res) {
  res.json((await userService.list()).map(toJson));
}
async function changeRole(req, res) {
  const { id, role } = matchedData(req);
  res.json({ user: toJson(await userService.changeRole(id, role, req.user)) });
}

module.exports = { list, changeRole };