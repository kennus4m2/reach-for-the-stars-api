const { Op } = require('sequelize');
const { QuestionSet, Question, Choice } = require('../models');
const { toOffset } = require('../utils/paginate');

// One query for the list: filter by host (null = everybody), search, sort, page.
function findPage({ hostId, q, sort = 'id', order = 'asc', page, limit }) {
  const where = {};
  if (hostId) where.host_id = hostId;
  if (q) where.title = { [Op.iLike]: `%${q}%` };      // q is bound as a parameter, never pasted into SQL
  return QuestionSet.findAndCountAll({ where, order: [[sort, order.toUpperCase()]], ...toOffset({ page, limit }) });
}
// include=questions: the set, its questions and their choices in ONE query (no N+1)
const findByIdWithQuestions = (id) => QuestionSet.findByPk(id, {
  include: [{ model: Question, as: 'questions', include: [{ model: Choice, as: 'choices' }] }],
  order: [[{ model: Question, as: 'questions' }, 'position', 'ASC'], [{ model: Question, as: 'questions' }, { model: Choice, as: 'choices' }, 'choice_index', 'ASC']],
});
const findById = (id) => QuestionSet.findByPk(id);
const create = (data) => QuestionSet.create(data);
const update = (questionSet, changes) => questionSet.update(changes);
const destroy = (questionSet) => questionSet.destroy();

module.exports = { findPage, findByIdWithQuestions, findById, create, update, destroy };