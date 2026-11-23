jest.mock('../../src/repositories/player.repository');
jest.mock('../../src/repositories/answer.repository');
jest.mock('../../src/repositories/question.repository');
jest.mock('../../src/services/session.service');
const playerRepository = require('../../src/repositories/player.repository');
const answerRepository = require('../../src/repositories/answer.repository');
const questionRepository = require('../../src/repositories/question.repository');
const sessionService = require('../../src/services/session.service');
const playService = require('../../src/services/play.service');

const user = { user_id: 3 };
const seatRow = (over = {}) => ({ id: 7, current_question_id: 5, question_served_at: new Date(), stars: 0, current_streak: 0, best_streak: 0,
  double_star_ready: false, protection_ready: false, correct_count: 0, answer_count: 0, total_answer_ms: '0', ...over });

beforeEach(() => {
  jest.resetAllMocks();
  sessionService.findOrFail.mockResolvedValue({ id: 1, status: 'ACTIVE', ends_at: null, question_set_id: 1 });
});

test('a user without a seat cannot answer, and nothing is saved', async () => {
  playerRepository.findSeat.mockResolvedValue(null);
  await expect(playService.submitAnswer('482731', { question_id: 5, choice_id: 9 }, user)).rejects.toMatchObject({ status: 403 });
  expect(answerRepository.record).not.toHaveBeenCalled();
});
test('a game that is not ACTIVE refuses answers', async () => {
  sessionService.findOrFail.mockResolvedValue({ id: 1, status: 'WAITING', ends_at: null, question_set_id: 1 });
  playerRepository.findSeat.mockResolvedValue(seatRow());
  await expect(playService.submitAnswer('482731', { question_id: 5, choice_id: 9 }, user)).rejects.toMatchObject({ code: 'GAME_NOT_ACTIVE' });
});
test('answering the same question twice is ALREADY_ANSWERED', async () => {
  playerRepository.findSeat.mockResolvedValue(seatRow({ current_question_id: null }));   // just answered
  answerRepository.findLatest.mockResolvedValue({ id: 1, question_id: 5 });
  await expect(playService.submitAnswer('482731', { question_id: 5, choice_id: 9 }, user)).rejects.toMatchObject({ status: 409, code: 'ALREADY_ANSWERED' });
  expect(answerRepository.record).not.toHaveBeenCalled();
});
test('a choice of another question is refused', async () => {
  playerRepository.findSeat.mockResolvedValue(seatRow());
  questionRepository.findChoice.mockResolvedValue({ id: 9, question_id: 6, is_correct: true });
  await expect(playService.submitAnswer('482731', { question_id: 5, choice_id: 9 }, user)).rejects.toMatchObject({ code: 'CHOICE_NOT_IN_QUESTION' });
});
test('a correct answer after the time limit scores as wrong', async () => {
  playerRepository.findSeat.mockResolvedValue(seatRow({ question_served_at: new Date(Date.now() - 30000), stars: 2 }));
  questionRepository.findChoice.mockResolvedValue({ id: 9, question_id: 5, is_correct: true });
  questionRepository.findWithChoices.mockResolvedValue({ id: 5, time_limit_sec: 20, choices: [{ id: 9, is_correct: true }] });
  questionRepository.countBySet.mockResolvedValue(5);
  answerRepository.record.mockResolvedValue({ saved: { is_correct: false, answer_time_ms: 30000 }, offer: null });
  await playService.submitAnswer('482731', { question_id: 5, choice_id: 9 }, user);
  expect(answerRepository.record.mock.calls[0][0].answer).toMatchObject({ is_correct: false, stars_earned: -1 });
});
test('the questions loop: after the last question comes the first again', async () => {
  playerRepository.findSeat.mockResolvedValue(seatRow({ current_question_id: null, answer_count: 5 }));
  questionRepository.countBySet.mockResolvedValue(5);
  questionRepository.findByPosition.mockResolvedValue({ id: 11, position: 1, choices: [] });
  const result = await playService.currentQuestion('482731', user);
  expect(questionRepository.findByPosition).toHaveBeenCalledWith(1, 1);
  expect(result.round).toBe(2);
});
test('after the timer ends the game is closed and the answer is refused', async () => {
  sessionService.findOrFail.mockResolvedValue({ id: 1, status: 'ACTIVE', ends_at: new Date(Date.now() - 1000), question_set_id: 1 });
  playerRepository.findSeat.mockResolvedValue(seatRow());
  await expect(playService.submitAnswer('482731', { question_id: 5, choice_id: 9 }, user)).rejects.toMatchObject({ code: 'GAME_TIME_UP' });
  expect(sessionService.endIfTimeIsUp).toHaveBeenCalled();
  expect(answerRepository.record).not.toHaveBeenCalled();
});
