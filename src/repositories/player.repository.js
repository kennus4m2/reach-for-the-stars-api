const { SessionPlayer } = require('../models');

// The seat of one account in one session, or null. This one query is the rejoin rule.
const findSeat = (sessionId, userId) => SessionPlayer.findOne({ where: { session_id: sessionId, user_id: userId } });
const countBySession = (sessionId) => SessionPlayer.count({ where: { session_id: sessionId } });
const create = (data) => SessionPlayer.create(data);
const findAllBySession = (sessionId) =>
  SessionPlayer.findAll({ where: { session_id: sessionId }, order: [['stars', 'DESC'], ['id', 'ASC']] });

module.exports = { findSeat, countBySession, create, findAllBySession };