const { matchedData } = require('express-validator');
const sessionService = require('../services/session.service');

const toJson = (s) => ({
  code: s.join_code, status: s.status, question_set_id: s.question_set_id, duration_sec: s.duration_sec,
  started_at: s.started_at, ends_at: s.ends_at, ended_at: s.ended_at, created_at: s.created_at,
});

async function create(req, res) {
  res.status(201).json(toJson(await sessionService.create(matchedData(req), req.user)));
}
async function get(req, res) {
  const { code } = matchedData(req);
  res.json(toJson(await sessionService.findOrFail(code)));
}
async function changeStatus(req, res) {
  const { code, status } = matchedData(req);
  res.json(toJson(await sessionService.changeStatus(code, status, req.user)));
}

module.exports = { create, get, changeStatus };