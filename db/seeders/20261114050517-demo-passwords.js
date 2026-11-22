'use strict';
const bcrypt = require('bcryptjs');
const PLACEHOLDER = 'seed-only-not-a-real-hash';   // what our Week 10 seeders stored
const DEMO_PASSWORD = 'Stars-Demo-2026';            // written in the README under "Demo accounts"
module.exports = {
  async up(q) {
    const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
    await q.bulkUpdate('users', { password_hash: hash }, { password_hash: PLACEHOLDER });
    await q.bulkInsert('users', [{
      school_id: '2099-0000', full_name: 'Demo Administrator', email: 'admin@demo.test',
      role: 'ADMIN', password_hash: hash,
    }]);
  },
  async down(q) {
    await q.bulkDelete('users', { school_id: '2099-0000' }, {});
    await q.bulkUpdate('users', { password_hash: PLACEHOLDER }, { school_id: { [q.sequelize.Sequelize.Op.like]: '2099-%' } });
  },
};