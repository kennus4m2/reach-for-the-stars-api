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
function list(user, query) {
  return questionSetRepository.findPage({ ...query, hostId: user.role === 'ADMIN' ? null : user.user_id });
}
async function get(id, user, include) {
  const questionSet = await findOwned(id, user);
  return include === 'questions' ? questionSetRepository.findByIdWithQuestions(id) : questionSet;
}
const create = (data, user) => questionSetRepository.create({ ...data, host_id: user.user_id });
async function update(id, changes, user) {
const questionSet = await findOwned(id, user);
return questionSetRepository.update(questionSet, changes);
}
async function remove(id, user) {
const questionSet = await findOwned(id, user);
  await questionSetRepository.destroy(questionSet);   // used by a game: the database says 409
}
async function setCover(id, file, user) {
  const questionSet = await findOwned(id, user);
  return questionSetRepository.update(questionSet, { cover_path: `/uploads/covers/${file.filename}` });
}

module.exports = { findOrFail, findOwned, list, get, create, update, remove, setCover };