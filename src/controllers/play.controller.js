const { matchedData } = require('express-validator');
const playService = require('../services/play.service');

async function question(req, res) {
  const { code } = matchedData(req);
  const { question: q, total, round } = await playService.currentQuestion(code, req.user);
  res.json({   // never is_correct
    question_id: q.id, position: q.position, total, round, text: q.text, time_limit_sec: q.time_limit_sec,
    choices: q.choices.map((c) => ({ choice_id: c.id, index: c.choice_index, text: c.text })),
  });
}
async function answer(req, res) {
  const { code, ...body } = matchedData(req);
  const r = await playService.submitAnswer(code, body, req.user);
  res.json({
    correct: r.saved.is_correct, late: r.late, correct_choice_id: r.correctChoiceId, stars_earned: r.earned,
    stars: r.stars, streak: r.streak, answer_time_ms: r.saved.answer_time_ms, round_completed: r.roundCompleted,
    chest_offer_id: r.offer ? r.offer.id : null,
  });
}
async function openChest(req, res) {
  const { code, offerId, slot } = matchedData(req);
  res.json({ reward: await playService.openChest(code, offerId, slot, req.user) });
}
async function leaderboard(req, res) {
  const { code, limit } = matchedData(req);
  res.json(await playService.leaderboard(code, limit || 10));
}

module.exports = { question, answer, openChest, leaderboard };
