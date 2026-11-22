const userRepository = require('../repositories/user.repository');
const { notFound, conflict } = require('../errors/app-error');

const list = () => userRepository.findAll();

async function changeRole(id, role, admin) {
  if (id === admin.user_id) throw conflict('CANNOT_CHANGE_OWN_ROLE', 'An admin cannot change their own role.');
  const user = await userRepository.findById(id);
  if (!user) throw notFound('USER_NOT_FOUND', `No account has the id ${id}.`);
  return userRepository.update(user, { role });
}

module.exports = { list, changeRole };