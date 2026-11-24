const { app, request, bearer } = require('../setup/helpers');
const { sequelize, GameSession } = require('../../src/models');

afterAll(() => sequelize.close());
let host; let player; let code; let questions;
const get = (url, who) => request(app).get(url).set('Authorization', who);

async function answerRight() {
  const q = await get(`/api/v1/sessions/${code}/question`, player);
  const right = questions.find((x) => x.id === q.body.question_id).choices.find((c) => c.is_correct).id;   // the host may see it
  const a = await request(app).post(`/api/v1/sessions/${code}/answers`).set('Authorization', player).send({ question_id: q.body.question_id, choice_id: right });
  return { q, a, right };
}

beforeAll(async () => {
  host = await bearer('2099-0001'); player = await bearer('2099-1003');
  const setId = (await request(app).post('/api/v1/question-sets').set('Authorization', host).send({ title: 'Loop Test Set' })).body.id;
  for (const text of ['First loop question?', 'Second loop question?']) {
    await request(app).post(`/api/v1/question-sets/${setId}/questions`).set('Authorization', host)
      .send({ text, choices: [{ text: 'Right', is_correct: true }, { text: 'Wrong', is_correct: false }] });
  }
  questions = (await get(`/api/v1/question-sets/${setId}?include=questions`, host)).body.questions;
  code = (await request(app).post('/api/v1/sessions').set('Authorization', host).send({ question_set_id: setId, duration_sec: 60 })).body.code;
  await request(app).post(`/api/v1/sessions/${code}/players`).set('Authorization', player).send({ nickname: 'Looper' });
  await request(app).patch(`/api/v1/sessions/${code}`).set('Authorization', host).send({ status: 'ACTIVE' });
});

test('the questions loop: after the last question the first one comes again (round 2)', async () => {
  const one = await answerRight();
  const two = await answerRight();
  expect([one.q.body.position, two.q.body.position]).toEqual([1, 2]);
  expect(two.a.body.round_completed).toBe(true);
  const again = await get(`/api/v1/sessions/${code}/question`, player);
  expect(again.status).toBe(200);
  expect(again.body).toMatchObject({ position: 1, round: 2 });
});
test('stars keep growing in round 2, and the same served question cannot be answered twice', async () => {
  const three = await answerRight();
  expect(three.a.body).toMatchObject({ correct: true, stars: 3, streak: 3 });
  const twice = await request(app).post(`/api/v1/sessions/${code}/answers`).set('Authorization', player)
    .send({ question_id: three.q.body.question_id, choice_id: three.right });
  expect(twice.status).toBe(409);
  expect(twice.body.error.code).toBe('ALREADY_ANSWERED');
});
test('when the timer ends the game is closed (409 GAME_TIME_UP) and /results lists it', async () => {
  await GameSession.update({ ends_at: new Date(Date.now() - 1000) }, { where: { join_code: code } });   // let the clock run out
  const late = await get(`/api/v1/sessions/${code}/question`, player);
  expect(late.status).toBe(409);
  expect(late.body.error.code).toBe('GAME_TIME_UP');
  expect((await get(`/api/v1/sessions/${code}`, player)).body.status).toBe('ENDED');
  const results = await request(app).get('/api/v1/results').set('X-Hub-Key', process.env.HUB_API_KEY);
  expect(results.status).toBe(200);
  expect(results.body.results.map((g) => g.session_code)).toContain(code);
});
