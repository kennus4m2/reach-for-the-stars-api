// Database settings for BOTH the running API and sequelize-cli.
// Values come from .env - nothing secret is written in this file.
const env = require('./env');
const base = { username: env.db.user, password: env.db.password, host: env.db.host, port: env.db.port, dialect: 'postgres', logging: false };
module.exports = {
  development: { ...base, database: env.db.name },
  test: { ...base, database: `${env.db.name}_test` },        // tests never touch your own data
  production: process.env.DATABASE_URL
  ? {
      use_env_variable: 'DATABASE_URL',
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    }
  : { ...base, database: env.db.name },
};

const settings = {
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: false,
  // Track seeders in a table, the same way migrations are tracked,
  // so running "db:seed:all" twice does not insert the data twice.
  seederStorage: 'sequelize',
  pool: { max: 10, min: 0, idle: 10000 },
};

module.exports = {
  development: settings,
  test: settings,
  production: settings,
};
