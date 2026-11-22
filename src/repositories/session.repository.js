const { GameSession } = require('../models');

const findByCode = (code) => GameSession.findOne({ where: { join_code: code } });
const create = (data) => GameSession.create(data);
const update = (session, changes) => session.update(changes);
const countForSet = (setId) => GameSession.count({ where: { question_set_id: setId } });

module.exports = { findByCode, create, update, countForSet };