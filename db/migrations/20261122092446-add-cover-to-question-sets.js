'use strict';
module.exports = {
  async up(q, S) { await q.addColumn('question_sets', 'cover_path', { type: S.STRING(255), allowNull: true }); },
  async down(q) { await q.removeColumn('question_sets', 'cover_path'); },
};