const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelleri dahil et
db.users = require('./user.model.js')(sequelize, Sequelize);
db.properties = require('./property.model.js')(sequelize, Sequelize);
db.reports = require('./report.model.js')(sequelize, Sequelize);
db.photos = require('./photo.model.js')(sequelize, Sequelize);
db.reportLogs = require('./reportLog.model.js')(sequelize, Sequelize);

// İlişkileri tanımla
db.users.hasMany(db.properties, { as: 'properties' });
db.properties.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});

db.properties.hasMany(db.reports, { as: 'reports' });
db.reports.belongsTo(db.properties, {
  foreignKey: 'propertyId',
  as: 'property',
});

db.reports.hasMany(db.photos, { as: 'photos' });
db.photos.belongsTo(db.reports, {
  foreignKey: 'reportId',
  as: 'report',
});

db.reports.hasMany(db.reportLogs, { as: 'logs' });
db.reportLogs.belongsTo(db.reports, {
  foreignKey: 'reportId',
  as: 'report',
});

module.exports = db;
