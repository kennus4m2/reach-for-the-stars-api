'use strict';
module.exports = {
async up(q, S) {
await q.createTable('users', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
school_id: { type: S.STRING(20), allowNull: false, unique: true },
username: { type: S.STRING(50), allowNull: false, unique: true },
password_hash: { type: S.STRING(255), allowNull: false },
display_name: { type: S.STRING(100), allowNull: false },
role: { type: S.STRING(10), allowNull: false, defaultValue: 'PLAYER' },
created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('now') },
});
await q.addConstraint('users', { type: 'check', name: 'ck_users_role', fields: ['role'], where: { role: ['HOST', 'PLAYER'] } });
},
async down(q) { await q.dropTable('users'); },
};
