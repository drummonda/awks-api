const Sequelize = require('sequelize')
const pkg = require('../package.json')

const databaseName = pkg.name;

function initDb() {
  try {
    return new Sequelize(
      process.env.DATABASE_URL || `postgres://localhost:5432/${databaseName}`,
      {
        logging: false,
        operatorsAliases: false,
      }
    ) 
  } catch (err) {
    console.log('Db creation failed');
    console.error(err.message);
  }
}

module.exports = initDb();

// This is a global Mocha hook used for resource cleanup.
// Otherwise, Mocha v4+ does not exit after tests.
if (process.env.NODE_ENV === 'test') {
  after('close database connection', () => db.close())
}