module.exports = (sequelize, DataTypes) =>
  sequelize.define('SessionPlayer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    session_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    nickname: { type: DataTypes.STRING(50), allowNull: false },
    stars: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    current_streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    best_streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    correct_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    answer_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total_answer_ms: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    double_star_ready: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    protection_ready: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    current_question_id: { type: DataTypes.INTEGER },
    question_served_at: { type: DataTypes.DATE },
  }, { tableName: 'session_players', timestamps: true, createdAt: 'joined_at', updatedAt: false });