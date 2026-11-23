const questionRepository = require('../repositories/question.repository');
const sessionRepository = require('../repositories/session.repository');
const questionSetService = require('./question-set.service');
const { notFound, conflict } = require('../errors/app-error');

// Rule: the owner only (403), and a set that a game already used is frozen (409).
async function ownedAndEditable(setId, user) {
  const questionSet = await questionSetService.findOwned(setId, user);
  if ((await sessionRepository.countForSet(questionSet.id)) > 0) {
    throw conflict('QUESTION_SET_FROZEN', 'A game already used this question set, so its questions cannot change.');
  }
  return questionSet;
}
async function findInSetOrFail(setId, id) {
  const question = await questionRepository.findInSet(setId, id);
  if (!question) throw notFound('QUESTION_NOT_FOUND', `Question set ${setId} has no question ${id}.`);
  return question;
}
async function list(setId, user) {
  await questionSetService.findOwned(setId, user);
  return questionRepository.findBySet(setId);
}
async function create(setId, data, user) {
  await ownedAndEditable(setId, user);
  return questionRepository.createWithChoices(setId, { time_limit_sec: 20, ...data });
}
async function update(setId, id, changes, user) {
  await ownedAndEditable(setId, user);
  return questionRepository.updateWithChoices(await findInSetOrFail(setId, id), changes);
}
async function remove(setId, id, user) {
  await ownedAndEditable(setId, user);
  await questionRepository.destroy(await findInSetOrFail(setId, id));
}

module.exports = { list, create, update, remove };