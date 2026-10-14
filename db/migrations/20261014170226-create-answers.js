'use strict';
module.exports = {
async up(q, S) {
await q.createTable('answers', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
player_id: { type: S.INTEGER, allowNull: false, references: { model: 'session_players', key: 'id' }, onDelete: 'CASCADE' },
question_id: { type: S.INTEGER, allowNull: false, references: { model: 'questions', key: 'id' }, onDelete: 'CASCADE' },
choice_id: { type: S.INTEGER, allowNull: true, references: { model: 'choices', key: 'id' }, onDelete: 'SET NULL' },
is_correct: { type: S.BOOLEAN, allowNull: false },
answer_time_ms: { type: S.INTEGER, allowNull: false },
stars_earned: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
streak_after: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
double_star_used: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
protection_used: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('now') },
});
await q.addConstraint('answers', { type: 'unique', name: 'uq_one_answer_per_question', fields: ['player_id', 'question_id'] });
},
async down(q) { await q.dropTable('answers'); },
};
