const { matchedData } = require('express-validator');
const questionSetService = require('../services/question-set.service');
const { envelope } = require('../utils/paginate');
const questionController = require('./question.controller');

const toJson = (s) => ({
  id: s.id, title: s.title, description: s.description, subject: s.subject, grade_level: s.grade_level,
  cover_url: s.cover_path, host_id: s.host_id, created_at: s.created_at,
  ...(s.questions && { questions: s.questions.map(questionController.toHostJson) }),
});

async function list(req, res) {
  const query = matchedData(req);
  const { rows, count } = await questionSetService.list(req.user, query);
  res.json(envelope(rows.map(toJson), count, { page: query.page, limit: query.limit }));
}
async function get(req, res) {
  const { id, include } = matchedData(req);
  res.json(toJson(await questionSetService.get(id, req.user, include)));
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
async function uploadCover(req, res) {
  const { id } = matchedData(req);
  res.json(toJson(await questionSetService.setCover(id, req.file, req.user)));
}

module.exports = { list, get, create, update, remove, uploadCover };