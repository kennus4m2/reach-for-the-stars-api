const sessionRepository = require('../repositories/session.repository');
const questionSetRepository = require('../repositories/question-set.repository');
const { notFound, forbidden, conflict } = require('../errors/app-error');
const { constraintOf } = require('../errors/db-errors');

// Hub Contract rule 5: six digits. 100000 to 999999 never starts with 0.
const randomCode = () => String(Math.floor(100000 + Math.random() * 900000));

// Rule: which status may follow which.
const NEXT_STATUS = { WAITING: ['ACTIVE', 'ENDED'], ACTIVE: ['ENDED'], ENDED: [] };

async function findOrFail(code) {
  const session = await sessionRepository.findByCode(code);
  if (!session) throw notFound('SESSION_NOT_FOUND', `No game uses the code ${code}.`);
  return session;
}
async function create({ question_set_id, duration_sec }, user) {
  const questionSet = await questionSetRepository.findById(question_set_id);
  if (!questionSet) throw notFound('QUESTION_SET_NOT_FOUND', `No question set has the id ${question_set_id}.`);
  if (questionSet.host_id !== user.user_id && user.role !== 'ADMIN') {
    throw forbidden('You can only start a game with your own question set.');
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await sessionRepository.create({
        host_id: user.user_id, question_set_id, join_code: randomCode(), status: 'WAITING',
        duration_sec: duration_sec || 300,
      });
    } catch (error) {
      if (constraintOf(error) !== 'sessions_join_code_key') throw error; // taken: try another code
    }
  }
  throw conflict('CODE_UNAVAILABLE', 'Could not make a free join code. Try again.');
}
async function changeStatus(code, status, user) {
  const session = await findOrFail(code);
  if (session.host_id !== user.user_id && user.role !== 'ADMIN') throw forbidden('This game belongs to another host.');
  if (!NEXT_STATUS[session.status].includes(status)) {
    throw conflict('INVALID_STATUS_CHANGE', `A ${session.status} game cannot change to ${status}.`);
  }
  const now = new Date();
  const changes = { status };
  if (status === 'ACTIVE') { changes.started_at = now; changes.ends_at = new Date(now.getTime() + session.duration_sec * 1000); }
  if (status === 'ENDED') changes.ended_at = now;
  return sessionRepository.update(session, changes);
}

module.exports = { findOrFail, create, changeStatus };