const { matchedData } = require('express-validator');
const questionSetService = require('../services/question-set.service');

// What a client is allowed to see of a question set.
const toJson = (s) => ({
  id: s.id, title: s.title, description: s.description, subject: s.subject,
  grade_level: s.grade_level, host_id: s.host_id, created_at: s.created_at,
});

async function list(req, res) {
  res.json((await questionSetService.list(req.user)).map(toJson));
}
async function get(req, res) {
  const { id } = matchedData(req);
  res.json(toJson(await questionSetService.get(id, req.user)));
}
async function create(req, res) {
  res.status(201).json(toJson(await questionSetService.create(matchedData(req), req.user)));
}
async function update(req, res) {
  const { id, ...changes } = matchedData(req);
  res.json(toJson(await questionSetService.update(id, changes, req.user)));
}
async function remove(req, res) {
  const { id } = matchedData(req);
  await questionSetService.remove(id, req.user);
  res.status(204).send();
}

module.exports = { list, get, create, update, remove };