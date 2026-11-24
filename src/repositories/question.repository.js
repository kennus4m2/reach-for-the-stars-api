const { sequelize, Question, Choice } = require('../models');

const withChoices = [{ model: Choice, as: 'choices' }];
const order = [['choices', 'choice_index', 'ASC']];

const findBySet = (setId) => Question.findAll({ where: { question_set_id: setId }, include: withChoices, order: [['position', 'ASC'], ...order] });
const findInSet = (setId, id) => Question.findOne({ where: { id, question_set_id: setId }, include: withChoices, order });
const findWithChoices = (id) => Question.findByPk(id, { include: withChoices, order });
const findByPosition = (setId, position) => Question.findOne({ where: { question_set_id: setId, position }, include: withChoices, order });
const countBySet = (setId) => Question.count({ where: { question_set_id: setId } });
const findChoice = (id) => Choice.findByPk(id);

// A question and its choices are saved together or not at all.
async function createWithChoices(setId, { text, time_limit_sec, choices }) {
  return sequelize.transaction(async (t) => {
    const position = ((await Question.max('position', { where: { question_set_id: setId }, transaction: t })) || 0) + 1;
    const created = await Question.create(
      { question_set_id: setId, position, text, type: 'multiple_choice', time_limit_sec },
      { transaction: t });
    const rows = await Choice.bulkCreate(
      choices.map((c, i) => ({ question_id: created.id, choice_index: i, text: c.text, is_correct: c.is_correct })),
      { transaction: t });
    // no second read: the answer is built from what was just saved
    return { id: created.id, position: created.position, text: created.text, time_limit_sec: created.time_limit_sec, choices: rows };
  });
}

async function updateWithChoices(question, { text, time_limit_sec, choices }) {
  await sequelize.transaction(async (t) => {
    await question.update({ ...(text && { text }), ...(time_limit_sec && { time_limit_sec }) }, { transaction: t });
    if (choices) {
      await Choice.destroy({ where: { question_id: question.id }, transaction: t });
      await Choice.bulkCreate(
        choices.map((c, i) => ({ question_id: question.id, choice_index: i, text: c.text, is_correct: c.is_correct })),
        { transaction: t });
    }
  });
  return findWithChoices(question.id);
}
const destroy = (question) => question.destroy();

module.exports = { findBySet, findInSet, findWithChoices, findByPosition, countBySet, findChoice, createWithChoices, updateWithChoices, destroy };