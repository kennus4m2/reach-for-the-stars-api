module.exports = (sequelize, DataTypes) =>
  sequelize.define('ChestOffer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    answer_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    player_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'PENDING' },
    picked_slot: { type: DataTypes.INTEGER },
    opened_at: { type: DataTypes.DATE },
  }, { tableName: 'chest_offers', timestamps: true, createdAt: 'created_at', updatedAt: false });