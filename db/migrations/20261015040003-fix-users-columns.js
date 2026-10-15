'use strict';
module.exports = {
  async up(q, S) {
    await q.renameColumn('users', 'id', 'user_id');
    await q.renameColumn('users', 'display_name', 'full_name');
    await q.addColumn('users', 'email', { type: S.STRING(100), allowNull: true });
    await q.sequelize.query("UPDATE users SET email = username || '@demo.test' WHERE email IS NULL");
    await q.changeColumn('users', 'email', { type: S.STRING(100), allowNull: false });
    await q.addConstraint('users', { type: 'unique', name: 'uq_users_email', fields: ['email'] });
  },
  async down(q) {
    await q.removeConstraint('users', 'uq_users_email');
    await q.removeColumn('users', 'email');
    await q.renameColumn('users', 'full_name', 'display_name');
    await q.renameColumn('users', 'user_id', 'id');
  },
};