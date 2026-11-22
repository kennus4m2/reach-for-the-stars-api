// ONE Sequelize instance (one connection pool) for the whole API.
// Every other file imports it from here - nobody opens a second one.
const { Sequelize, DataTypes } = require('sequelize');
const env = require('../config/env');
const dbConfig = require('../config/database')[env.nodeEnv];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Week 11: load your models here, one line each, then add their associations.
// Example:
//   const User = require('./user')(sequelize, DataTypes);
//   const Player = require('./player')(sequelize, DataTypes);
//   User.hasMany(Player, { foreignKey: 'user_id' });
//   Player.belongsTo(User, { foreignKey: 'user_id' });
const User = require('./user')(sequelize, DataTypes);
const QuestionSet = require('./question-set')(sequelize, DataTypes);
const Question = require('./question')(sequelize, DataTypes);
const Choice = require('./choice')(sequelize, DataTypes);
const GameSession = require('./session')(sequelize, DataTypes);
const SessionPlayer = require('./session-player')(sequelize, DataTypes);
const Answer = require('./answer')(sequelize, DataTypes);
const ChestOffer = require('./chest-offer')(sequelize, DataTypes);
const ChestSlot = require('./chest-slot')(sequelize, DataTypes);

User.hasMany(QuestionSet, { foreignKey: 'host_id' });
QuestionSet.belongsTo(User, { foreignKey: 'host_id', as: 'host' });
QuestionSet.hasMany(Question, { foreignKey: 'question_set_id', as: 'questions' });
Question.belongsTo(QuestionSet, { foreignKey: 'question_set_id' });
Question.hasMany(Choice, { foreignKey: 'question_id', as: 'choices' });
Choice.belongsTo(Question, { foreignKey: 'question_id' });
QuestionSet.hasMany(GameSession, { foreignKey: 'question_set_id' });
GameSession.belongsTo(QuestionSet, { foreignKey: 'question_set_id' });
GameSession.hasMany(SessionPlayer, { foreignKey: 'session_id' });
SessionPlayer.belongsTo(GameSession, { foreignKey: 'session_id' });
User.hasMany(SessionPlayer, { foreignKey: 'user_id' });
SessionPlayer.belongsTo(User, { foreignKey: 'user_id' });
SessionPlayer.hasMany(Answer, { foreignKey: 'player_id' });
Answer.belongsTo(SessionPlayer, { foreignKey: 'player_id' });
Answer.hasOne(ChestOffer, { foreignKey: 'answer_id' });
ChestOffer.belongsTo(Answer, { foreignKey: 'answer_id' });
ChestOffer.hasMany(ChestSlot, { foreignKey: 'chest_offer_id', as: 'slots' });
ChestSlot.belongsTo(ChestOffer, { foreignKey: 'chest_offer_id' });

module.exports = { sequelize, Sequelize, DataTypes, User, QuestionSet, Question, Choice, GameSession, SessionPlayer, Answer, ChestOffer, ChestSlot };