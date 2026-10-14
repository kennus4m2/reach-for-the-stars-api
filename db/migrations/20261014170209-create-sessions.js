'use strict';
module.exports = {
async up(q, S) {
await q.createTable('sessions', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
host_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
question_set_id: { type: S.INTEGER, allowNull: false, references: { model: 'question_sets', key: 'id' }, onDelete: 'RESTRICT' },
join_code: { type: S.STRING(10), allowNull: false, unique: true },
status: { type: S.STRING(50), allowNull: false, defaultValue: 'WAITING' },
duration_sec: { type: S.INTEGER, allowNull: false },
started_at: { type: S.DATE, allowNull: true },
ends_at: { type: S.DATE, allowNull: true },
ended_at: { type: S.DATE, allowNull: true },
created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('now') },
});
await q.addConstraint('sessions', { type: 'check', name: 'ck_session_status', fields: ['status'], where: { status: ['WAITING', 'ACTIVE', 'ENDED'] } });
},
async down(q) { await q.dropTable('sessions'); },
};
