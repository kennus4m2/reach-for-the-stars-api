jest.mock('../../src/repositories/user.repository');     // no database: the repository is replaced
const userRepository = require('../../src/repositories/user.repository');
const password = require('../../src/security/password');
const authService = require('../../src/services/auth.service');

beforeEach(() => jest.resetAllMocks());

test('a wrong password and an unknown school ID fail with the SAME error', async () => {
  const hash = await password.hash('Right-Pass-1');
  userRepository.findForLogin.mockResolvedValueOnce({ user_id: 1, role: 'PLAYER', password_hash: hash });
  const wrong = await authService.login({ school_id: '2099-1001', password: 'Wrong-Pass-1' }).catch((e) => e);
  userRepository.findForLogin.mockResolvedValueOnce(null);
  const unknown = await authService.login({ school_id: '2099-7777', password: 'Wrong-Pass-1' }).catch((e) => e);
  expect(wrong.status).toBe(401);
  expect({ status: unknown.status, code: unknown.code, message: unknown.message })
    .toEqual({ status: wrong.status, code: wrong.code, message: wrong.message });
});
test('register always creates a PLAYER and stores a bcrypt hash, never the password', async () => {
  userRepository.create.mockImplementation(async (data) => data);
  const saved = await authService.register({ school_id: '2099-5000', full_name: 'Test', email: 't@demo.test', password: 'Plain-Pass-1', role: 'ADMIN' });
  expect(saved.role).toBe('PLAYER');
  expect(saved.password_hash).toMatch(/^\$2[aby]\$/);
  expect(JSON.stringify(saved)).not.toContain('Plain-Pass-1');
});
