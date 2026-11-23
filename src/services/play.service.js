const questionRepository = require('../repositories/question.repository');
const playerRepository = require('../repositories/player.repository');
const answerRepository = require('../repositories/answer.repository');
const chestRepository = require('../repositories/chest.repository');
const sessionService = require('./session.service');
const scoring = require('./scoring');
const { badRequest, forbidden, notFound, conflict } = require('../errors/app-error');

const REWARDS = ['DOUBLE_STAR', 'STREAK_PROTECTION', 'EMPTY'];
const shuffled = (list) => [...list].sort(() => Math.random() - 0.5);

async function seatOf(code, user) {
  const session = await sessionService.findOrFail(code);
  const seat = await playerRepository.findSeat(session.id, user.user_id);
  if (!seat) throw forbidden('You have no seat in this game. Join it first.');
  return { session, seat };
}
async function mustBeActive(session) {
  if (session.status === 'ACTIVE' && session.ends_at && new Date() > new Date(session.ends_at)) {
    await sessionService.endIfTimeIsUp(session);          // the timer ended: close the game for everybody
    throw conflict('GAME_TIME_UP', 'The time of this game is over.');
  }
  if (session.status !== 'ACTIVE') throw conflict('GAME_NOT_ACTIVE', 'The game is not running.');
}

// Each player goes through the questions at their own pace. The questions LOOP:
// after the last one comes the first again, until the timer of the game ends.
async function currentQuestion(code, user) {
  const { session, seat } = await seatOf(code, user);
  await mustBeActive(session);
  const total = await questionRepository.countBySet(session.question_set_id);
  if (!total) throw conflict('NO_QUESTIONS', 'This question set has no questions.');
  const question = await questionRepository.findByPosition(session.question_set_id, (seat.answer_count % total) + 1);
  if (seat.current_question_id !== question.id) {   // the clock starts once; refreshing does not reset it
    await playerRepository.update(seat, { current_question_id: question.id, question_served_at: new Date() });
  }
  return { question, total, round: Math.floor(seat.answer_count / total) + 1 };
}

async function submitAnswer(code, { question_id, choice_id }, user) {
  const { session, seat } = await seatOf(code, user);
  await mustBeActive(session);
  if (seat.current_question_id !== question_id) {
    const last = await answerRepository.findLatest(seat.id);
    if (!seat.current_question_id && last && last.question_id === question_id) {
      throw conflict('ALREADY_ANSWERED', 'You already answered this question. Ask for the next one with GET /question.');
    }
    throw conflict('NOT_CURRENT_QUESTION', 'Answer the question you were served. Ask for it with GET /question.');
  }
  const choice = await questionRepository.findChoice(choice_id);
  if (!choice || choice.question_id !== question_id) throw badRequest('CHOICE_NOT_IN_QUESTION', 'That choice does not belong to this question.');

  const question = await questionRepository.findWithChoices(question_id);
  const elapsedMs = Date.now() - new Date(seat.question_served_at).getTime();   // the SERVER measures time
  const correct = choice.is_correct && !scoring.isLate(elapsedMs, question.time_limit_sec);
  const r = scoring.applyAnswer(seat, correct);
  const total = await questionRepository.countBySet(session.question_set_id);

  const { saved, offer } = await answerRepository.record({
    seat,
    answer: { player_id: seat.id, question_id, choice_id, is_correct: correct, answer_time_ms: elapsedMs, stars_earned: r.earned,
      streak_after: r.streak, double_star_used: r.usedDouble, protection_used: r.usedProtection },
    seatChanges: {
      stars: r.stars, current_streak: r.streak, best_streak: r.best, double_star_ready: r.doubleReady, protection_ready: r.protectionReady,
      correct_count: seat.correct_count + (correct ? 1 : 0), answer_count: seat.answer_count + 1,
      total_answer_ms: Number(seat.total_answer_ms) + elapsedMs, current_question_id: null, question_served_at: null,
    },
    chestRewards: r.chest ? shuffled(REWARDS) : null,
  });
  const correctChoice = question.choices.find((c) => c.is_correct);
  return { saved, offer, correctChoiceId: correctChoice.id, stars: r.stars, streak: r.streak, earned: r.earned,
    late: choice.is_correct && !correct, roundCompleted: (seat.answer_count + 1) % total === 0 };
}

async function openChest(code, offerId, slotNumber, user) {
  const { seat } = await seatOf(code, user);
  const offer = await chestRepository.findOffer(offerId);
  if (!offer) throw notFound('CHEST_NOT_FOUND', `No chest has the id ${offerId}.`);
  if (offer.player_id !== seat.id) throw forbidden('This chest belongs to another player.');
  if (offer.status !== 'PENDING') throw conflict('CHEST_ALREADY_OPENED', 'This chest was already opened.');
  const slot = await chestRepository.findSlot(offer.id, slotNumber);
  const changes = {};
  if (slot.reward_type === 'DOUBLE_STAR') changes.double_star_ready = true;
  if (slot.reward_type === 'STREAK_PROTECTION') changes.protection_ready = true;
  await chestRepository.open(offer, slotNumber, seat, changes);
  return slot.reward_type;
}

async function leaderboard(code, limit) {
  const session = await sessionService.findOrFail(code);
  const players = await playerRepository.findRanked(session.id, limit);
  return scoring.rankByStars(players.map((p) => ({ nickname: p.nickname, stars: p.stars, best_streak: p.best_streak })));
}

module.exports = { currentQuestion, submitAnswer, openChest, leaderboard };
