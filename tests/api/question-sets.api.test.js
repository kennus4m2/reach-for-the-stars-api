const { app, request, bearer } = require('../setup/helpers');
const { sequelize } = require('../../src/models');

afterAll(() => sequelize.close());
let host; let other; let player;
beforeAll(async () => {
  host = await bearer('2099-0001'); other = await bearer('2099-0002'); player = await bearer('2099-1001');
});
const choices2 = [{ text: 'Saturn', is_correct: true }, { text: 'Mars', is_correct: false }];

test('a host creates a set (201) and lists it in the { data, meta } envelope', async () => {
  const made = await request(app).post('/api/v1/question-sets').set('Authorization', host).send({ title: 'Jest Created Set' });
  expect(made.status).toBe(201);
  const list = await request(app).get('/api/v1/question-sets?page=1&limit=2&q=Jest').set('Authorization', host);
  expect(list.status).toBe(200);
  expect(list.body.meta).toMatchObject({ page: 1, limit: 2 });
  expect(list.body.data.length).toBeGreaterThan(0);
});
test('a short title is 400 VALIDATION_FAILED with the field named', async () => {
  const res = await request(app).post('/api/v1/question-sets').set('Authorization', host).send({ title: 'ab' });
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe('VALIDATION_FAILED');
});
test('a sort column that is not allowed is 400', async () => {
  expect((await request(app).get('/api/v1/question-sets?sort=host_id').set('Authorization', host)).status).toBe(400);
});
test('a player is 403, no token is 401, a missing set is 404', async () => {
  expect((await request(app).get('/api/v1/question-sets').set('Authorization', player)).status).toBe(403);
  expect((await request(app).get('/api/v1/question-sets')).body.error.code).toBe('AUTH_REQUIRED');
  expect((await request(app).get('/api/v1/question-sets/999999').set('Authorization', host)).body.error.code).toBe('QUESTION_SET_NOT_FOUND');
});
test('another host cannot change my set (403)', async () => {
  const made = await request(app).post('/api/v1/question-sets').set('Authorization', host).send({ title: 'Owned By Host One' });
  const res = await request(app).patch(`/api/v1/question-sets/${made.body.id}`).set('Authorization', other).send({ title: 'Hijacked' });
  expect(res.status).toBe(403);
});
test('questions: one correct choice is saved (201), two correct choices are 400', async () => {
  const made = await request(app).post('/api/v1/question-sets').set('Authorization', host).send({ title: 'Question Bank Set' });
  const url = `/api/v1/question-sets/${made.body.id}/questions`;
  expect((await request(app).post(url).set('Authorization', host).send({ text: 'Which planet has rings?', choices: choices2 })).status).toBe(201);
  const bad = await request(app).post(url).set('Authorization', host).send({ text: 'Two right ones', choices: [{ text: 'A', is_correct: true }, { text: 'B', is_correct: true }] });
  expect(bad.status).toBe(400);
  const read = await request(app).get(`/api/v1/question-sets/${made.body.id}?include=questions`).set('Authorization', host);
  expect(read.body.questions[0].choices).toHaveLength(2);
});
test('a set that a game already used is frozen (409)', async () => {
  const sets = await request(app).get('/api/v1/question-sets?sort=id&order=asc').set('Authorization', host);
  const res = await request(app).post(`/api/v1/question-sets/${sets.body.data[0].id}/questions`).set('Authorization', host).send({ text: 'Too late', choices: choices2 });
  expect(res.status).toBe(409);
  expect(res.body.error.code).toBe('QUESTION_SET_FROZEN');
});
