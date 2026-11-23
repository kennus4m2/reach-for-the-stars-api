module.exports = (sequelize, DataTypes) =>
  sequelize.define('ChestSlot', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chest_offer_id: { type: DataTypes.INTEGER, allowNull: false },
    slot_number: { type: DataTypes.INTEGER, allowNull: false },
    reward_type: { type: DataTypes.STRING(50), allowNull: false },
  }, { tableName: 'chest_slots', timestamps: false });