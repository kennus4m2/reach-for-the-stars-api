'use strict';
module.exports = {
async up(q, S) {
await q.createTable('chest_offers', {
id: { type: S.INTEGER, primaryKey: true, autoIncrement: true },
answer_id: { type: S.INTEGER, allowNull: false, unique: true, references: { model: 'answers', key: 'id' }, onDelete: 'CASCADE' },
player_id: { type: S.INTEGER, allowNull: false, references: { model: 'session_players', key: 'id' }, onDelete: 'CASCADE' },
status: { type: S.STRING(50), allowNull: false, defaultValue: 'PENDING' },
picked_slot: { type: S.INTEGER, allowNull: true },
created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('now') },
opened_at: { type: S.DATE, allowNull: true },
});
await q.addConstraint('chest_offers', { type: 'check', name: 'ck_chest_status', fields: ['status'], where: { status: ['PENDING', 'OPENED', 'EXPIRED'] } });
},
async down(q) { await q.dropTable('chest_offers'); },
};
