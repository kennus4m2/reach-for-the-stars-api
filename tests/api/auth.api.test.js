const { app, request, bearer } = require('../setup/helpers');
const { sequelize } = require('../../src/models');

afterAll(() => sequelize.close());
const newId = () => `2097-${Math.floor(1000 + Math.random() * 8999)}`;

describe('POST /auth/register', () => {
  test('creates a PLAYER even when ADMIN is asked, and never returns the password', async () => {
    const res = await request(app).post('/api/v1/auth/register')
      .send({ school_id: newId(), full_name: 'Test Student', email: `${Date.now()}@demo.test`, password: 'Starry-Pass-1', role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('PLAYER');
    expect(res.text).not.toMatch(/password|\$2[aby]\$/i);
  });
  test('a taken school ID is 409 SCHOOL_ID_TAKEN', async () => {
    const res = await request(app).post('/api/v1/auth/register')
      .send({ school_id: '2099-1001', full_name: 'Copycat', email: 'copycat@demo.test', password: 'Starry-Pass-1' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SCHOOL_ID_TAKEN');
  });
  test('a weak password is 400 VALIDATION_FAILED', async () => {
    const res = await request(app).post('/api/v1/auth/register')
      .send({ school_id: newId(), full_name: 'Weak', email: 'weak@demo.test', password: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });
});
describe('login, me and roles', () => {
  test('login answers 200 with a token; a wrong password and an unknown ID look the same', async () => {
    const ok = await request(app).post('/api/v1/auth/login').send({ school_id: '2099-1001', password: 'Stars-Demo-2026' });
    expect(ok.status).toBe(200);
    expect(ok.body.token.split('.')).toHaveLength(3);
    const wrong = await request(app).post('/api/v1/auth/login').send({ school_id: '2099-1001', password: 'Wrong-Pass-9' });
    const nobody = await request(app).post('/api/v1/auth/login').send({ school_id: '2099-7777', password: 'Wrong-Pass-9' });
    expect(wrong.status).toBe(401);
    expect(nobody.body).toEqual(wrong.body);
  });
  test('/auth/me: no token is AUTH_REQUIRED, a changed token is INVALID_TOKEN', async () => {
    expect((await request(app).get('/api/v1/auth/me')).body.error.code).toBe('AUTH_REQUIRED');
    const token = (await bearer('2099-1001')).replace('Bearer ', '');
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}x`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
  test('a player gets 403 on /users and an admin gets 200', async () => {
    expect((await request(app).get('/api/v1/users').set('Authorization', await bearer('2099-1001'))).status).toBe(403);
    expect((await request(app).get('/api/v1/users').set('Authorization', await bearer('2099-0000'))).status).toBe(200);
  });
});
