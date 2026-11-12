const questionSetRepository = require('../repositories/question-set.repository');
const { notFound, forbidden } = require('../errors/app-error');

async function findOrFail(id) {
  const questionSet = await questionSetRepository.findById(id);
  if (!questionSet) throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${id}.`);
  return questionSet;
}
const isOwner = (questionSet, user) => questionSet.host_id === user.user_id || user.role === 'ADMIN';

// Rule: a host may read, change or delete only the question sets that he or she made.
async function findOwned(id, user) {
  const questionSet = await findOrFail(id);
  if (!isOwner(questionSet, user)) throw forbidden('This question set belongs to another host.');
  return questionSet;
}
function list(user) {
  return user.role === 'ADMIN' ? questionSetRepository.findAll() : questionSetRepository.findAllByHost(user.user_id);
}
const get = (id, user) => findOwned(id, user);
const create = (data, user) => questionSetRepository.create({ ...data, host_id: user.user_id });
async function update(id, changes, user) {
  const questionSet = await findOwned(id, user);
  return questionSetRepository.update(questionSet, changes);
}
async function remove(id, user) {
  const questionSet = await findOwned(id, user);
  await questionSetRepository.destroy(questionSet); // a set used by a game: the database says 409
}

module.exports = { findOrFail, list, get, create, update, remove };