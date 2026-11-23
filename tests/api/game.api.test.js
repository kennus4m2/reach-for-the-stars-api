const { app, request, bearer } = require('../setup/helpers');
const { sequelize } = require('../../src/models');

afterAll(() => sequelize.close());
let host; let p1; let p2; let setId; let code; let rightChoice;

beforeAll(async () => {
  host = await bearer('2099-0001'); p1 = await bearer('2099-1001'); p2 = await bearer('2099-1002');
  const sets = await request(app).get('/api/v1/question-sets?sort=id&order=asc').set('Authorization', host);
  setId = sets.body.data[0].id;
  const full = await request(app).get(`/api/v1/question-sets/${setId}?include=questions`).set('Authorization', host);
  rightChoice = full.body.questions[0].choices.find((c) => c.is_correct).id;   // the host may see it
  code = (await request(app).post('/api/v1/sessions').set('Authorization', host).send({ question_set_id: setId })).body.code;
});

describe('sessions and joining', () => {
  test('the code has six digits and a player cannot start a game', async () => {
    expect(code).toMatch(/^[1-9][0-9]{5}$/);
    expect((await request(app).post('/api/v1/sessions').set('Authorization', p1).send({ question_set_id: setId })).status).toBe(403);
  });
  test('join gives 201, and the same account joining again gets 200 with the same seat', async () => {
    const first = await request(app).post(`/api/v1/sessions/${code}/players`).set('Authorization', p1).send({ nickname: 'Nova' });
    const again = await request(app).post(`/api/v1/sessions/${code}/players`).set('Authorization', p1).send({ nickname: 'Nova' });
    expect(first.status).toBe(201);
    expect(again.status).toBe(200);
    expect(again.body.player_id).toBe(first.body.player_id);
  });
  test('a used nickname is 409 NICKNAME_TAKEN', async () => {
    const res = await request(app).post(`/api/v1/sessions/${code}/players`).set('Authorization', p2).send({ nickname: 'Nova' });
    expect(res.body.error.code).toBe('NICKNAME_TAKEN');
  });
});
describe('playing', () => {
  test('no question before the game starts (409 GAME_NOT_ACTIVE)', async () => {
    const res = await request(app).get(`/api/v1/sessions/${code}/question`).set('Authorization', p1);
    expect(res.body.error.code).toBe('GAME_NOT_ACTIVE');
  });
  test('after the start, a new player cannot join (409)', async () => {
    expect((await request(app).patch(`/api/v1/sessions/${code}`).set('Authorization', host).send({ status: 'ACTIVE' })).status).toBe(200);
    const res = await request(app).post(`/api/v1/sessions/${code}/players`).set('Authorization', p2).send({ nickname: 'Orion' });
    expect(res.body.error.code).toBe('GAME_ALREADY_STARTED');
  });
  test('the question never shows is_correct; a correct answer earns a star; answering twice is 409', async () => {
    const q = await request(app).get(`/api/v1/sessions/${code}/question`).set('Authorization', p1);
    expect(q.status).toBe(200);
    expect(JSON.stringify(q.body)).not.toContain('is_correct');
    const ok = await request(app).post(`/api/v1/sessions/${code}/answers`).set('Authorization', p1).send({ question_id: q.body.question_id, choice_id: rightChoice });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ correct: true, stars: 1, streak: 1 });
    const twice = await request(app).post(`/api/v1/sessions/${code}/answers`).set('Authorization', p1).send({ question_id: q.body.question_id, choice_id: rightChoice });
    expect(twice.body.error.code).toBe('ALREADY_ANSWERED');
  });
  test('the leaderboard ranks the player and the host can end the game', async () => {
    const board = await request(app).get(`/api/v1/sessions/${code}/leaderboard`).set('Authorization', p1);
    expect(board.body[0]).toMatchObject({ nickname: 'Nova', stars: 1, rank: 1 });
    expect((await request(app).patch(`/api/v1/sessions/${code}`).set('Authorization', host).send({ status: 'ENDED' })).status).toBe(200);
    const bad = await request(app).patch(`/api/v1/sessions/${code}`).set('Authorization', host).send({ status: 'ACTIVE' });
    expect(bad.body.error.code).toBe('INVALID_STATUS_CHANGE');
  });
});
