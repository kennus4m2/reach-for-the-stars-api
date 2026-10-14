'use strict';
module.exports = {
async up(q, S) {
await q.createTable('session_players', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
session_id: { type: S.INTEGER, allowNull: false, references: { model: 'sessions', key: 'id' }, onDelete: 'CASCADE' },
user_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'RESTRICT' },
nickname: { type: S.STRING(50), allowNull: false },
stars: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
current_streak: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
best_streak: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
correct_count: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
answer_count: { type: S.INTEGER, allowNull: false, defaultValue: 0 },
total_answer_ms: { type: S.BIGINT, allowNull: false, defaultValue: 0 },
double_star_ready: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
protection_ready: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
current_question_id: { type: S.INTEGER, allowNull: true, references: { model: 'questions', key: 'id' }, onDelete: 'SET NULL' },
question_served_at: { type: S.DATE, allowNull: true },
joined_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('now') },
});
await q.addConstraint('session_players', { type: 'unique', name: 'uq_one_seat', fields: ['session_id', 'user_id'] });
await q.addConstraint('session_players', { type: 'unique', name: 'uq_player_nickname', fields: ['session_id', 'nickname'] });
await q.addConstraint('session_players', { type: 'check', name: 'ck_stars_not_negative', fields: ['stars'], where: { stars: { [S.Op.gte]: 0 } } });
},
async down(q) { await q.dropTable('session_players'); },
};
