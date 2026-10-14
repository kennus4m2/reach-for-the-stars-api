'use strict';
module.exports = {
async up(q, S) {
await q.createTable('questions', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
question_set_id: { type: S.INTEGER, allowNull: false, references: { model: 'question_sets', key: 'id' }, onDelete: 'CASCADE' },
position: { type: S.INTEGER, allowNull: false },
text: { type: S.TEXT, allowNull: false },
type: { type: S.STRING(50), allowNull: false },
time_limit_sec: { type: S.INTEGER, allowNull: false, defaultValue: 30 },
});
await q.addConstraint('questions', { type: 'unique', name: 'uq_question_position', fields: ['question_set_id', 'position'] });
await q.addConstraint('questions', { type: 'check', name: 'ck_question_time_positive', fields: ['time_limit_sec'], where: { time_limit_sec: { [S.Op.gt]: 0 } } });
},
async down(q) { await q.dropTable('questions'); },
};
