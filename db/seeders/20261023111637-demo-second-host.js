'use strict';
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [{
      school_id: '2099-0002', username: 'librarian2', password_hash: 'seed-only-not-a-real-hash',
      full_name: 'Second Demo Librarian', email: 'librarian2@demo.test', role: 'HOST',
    }]);
  },
  async down(queryInterface) { await queryInterface.bulkDelete('users', { school_id: '2099-0002' }, {}); },
};