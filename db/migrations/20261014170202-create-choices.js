'use strict';
module.exports = {
async up(q, S) {
await q.createTable('choices', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
question_id: { type: S.INTEGER, allowNull: false, references: { model: 'questions', key: 'id' }, onDelete: 'CASCADE' },
choice_index: { type: S.INTEGER, allowNull: false },
text: { type: S.TEXT, allowNull: false },
is_correct: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
});
await q.addConstraint('choices', { type: 'unique', name: 'uq_choice_index', fields: ['question_id', 'choice_index'] });
},
async down(q) { await q.dropTable('choices'); },
};
