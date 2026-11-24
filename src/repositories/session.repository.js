const { GameSession } = require('../models');

const findByCode = (code) => GameSession.findOne({ where: { join_code: code } });
const create = (data) => GameSession.create(data);
const update = (session, changes) => session.update(changes);
const countForSet = (setId) => GameSession.count({ where: { question_set_id: setId } });

const { toOffset } = require('../utils/paginate');

const findPage = ({ hostId, sort = 'id', order = 'desc', page, limit }) => GameSession.findAndCountAll({ where: hostId ? { host_id: hostId } : {}, order: [[sort, order.toUpperCase()]], ...toOffset({ page, limit }) });

module.exports = { findByCode, create, update, countForSet, findPage }; 
