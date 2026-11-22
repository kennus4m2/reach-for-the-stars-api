'use strict';
// Week 10 made username and password_hash NOT NULL. Login now uses school_id + a 60-character bcrypt hash.
module.exports = {
  async up(q, S) {
    await q.changeColumn('users', 'username', { type: S.STRING(50), allowNull: true });
    await q.changeColumn('users', 'password_hash', { type: S.STRING(60), allowNull: true });
  },
  async down(q, S) {
    await q.sequelize.query("UPDATE users SET username = school_id WHERE username IS NULL");
    await q.sequelize.query("UPDATE users SET password_hash = 'none' WHERE password_hash IS NULL");
    await q.changeColumn('users', 'username', { type: S.STRING(50), allowNull: false });
    await q.changeColumn('users', 'password_hash', { type: S.STRING(255), allowNull: false });
  },
};