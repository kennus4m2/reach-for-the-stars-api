const { matchedData } = require('express-validator');
const questionService = require('../services/question.service');

// The host sees which choice is correct. Players never reach this endpoint.
const toHostJson = (q) => ({
  id: q.id, position: q.position, text: q.text, time_limit_sec: q.time_limit_sec,
  choices: (q.choices || []).map((c) => ({ id: c.id, index: c.choice_index, text: c.text, is_correct: c.is_correct })),
});

async function list(req, res) {
  const { id } = matchedData(req);
  res.json((await questionService.list(id, req.user)).map(toHostJson));
}
async function create(req, res) {
  const { id, ...data } = matchedData(req);
  res.status(201).json(toHostJson(await questionService.create(id, data, req.user)));
}
async function update(req, res) {
  const { id, questionId, ...changes } = matchedData(req);
  res.json(toHostJson(await questionService.update(id, questionId, changes, req.user)));
}
async function remove(req, res) {
  const { id, questionId } = matchedData(req);
  await questionService.remove(id, questionId, req.user);
  res.status(204).send();
}

module.exports = { list, create, update, remove, toHostJson };