const { QuestionSet } = require('../models');

const findAll = () => QuestionSet.findAll({ order: [['id', 'ASC']] });
const findAllByHost = (hostId) => QuestionSet.findAll({ where: { host_id: hostId }, order: [['id', 'ASC']] });
const findById = (id) => QuestionSet.findByPk(id);
const create = (data) => QuestionSet.create(data);
const update = (questionSet, changes) => questionSet.update(changes);
const destroy = (questionSet) => questionSet.destroy();

module.exports = { findAll, findAllByHost, findById, create, update, destroy };