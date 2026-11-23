'use strict';
module.exports = {
  async up(q) {
    await q.removeConstraint('users', 'ck_users_role');
    await q.addConstraint('users', {
      type: 'check',
      name: 'ck_users_role',
      fields: ['role'],
      where: { role: ['PLAYER', 'HOST', 'ADMIN'] },
    });
  },
  async down(q) {
    await q.removeConstraint('users', 'ck_users_role');
    await q.addConstraint('users', {
      type: 'check',
      name: 'ck_users_role',
      fields: ['role'],
      where: { role: ['HOST', 'PLAYER'] },
    });
  },
};