'use strict';
module.exports = {
async up(q, S) {
await q.createTable('question_sets', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
host_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
title: { type: S.STRING(255), allowNull: false },
description: { type: S.TEXT, allowNull: true },
subject: { type: S.STRING(100), allowNull: true },
grade_level: { type: S.STRING(50), allowNull: true },
created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('now') },
});

},
async down(q) { await q.dropTable('question_sets'); },
};
