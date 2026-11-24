const { SessionPlayer } = require('../models');

const findSeat = (sessionId, userId) => SessionPlayer.findOne({ where: { session_id: sessionId, user_id: userId } });
const countBySession = (sessionId) => SessionPlayer.count({ where: { session_id: sessionId } });
const create = (data) => SessionPlayer.create(data);
const update = (seat, changes) => seat.update(changes);
const findAllBySession = (sessionId) =>
  SessionPlayer.findAll({ where: { session_id: sessionId }, order: [['stars', 'DESC'], ['id', 'ASC']] });
// best first: stars, then more correct answers, then the faster total time
const findRanked = (sessionId, limit) => SessionPlayer.findAll({
  where: { session_id: sessionId },
  order: [['stars', 'DESC'], ['correct_count', 'DESC'], ['total_answer_ms', 'ASC'], ['id', 'ASC']],
  limit,
});

module.exports = { findSeat, countBySession, create, update, findAllBySession, findRanked };