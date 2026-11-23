'use strict';
// The questions now loop until the timer ends, so one player answers the same question many times.
module.exports = {
  async up(q) {
    await q.removeConstraint('answers', 'uq_one_answer_per_question');
  },
  async down(q) {
    // keep only the first answer of each player and question, then bring the rule back
    await q.sequelize.query('DELETE FROM answers a USING answers b WHERE a.player_id = b.player_id AND a.question_id = b.question_id AND a.id > b.id');
    await q.addConstraint('answers', { type: 'unique', name: 'uq_one_answer_per_question', fields: ['player_id', 'question_id'] });
  },
};
