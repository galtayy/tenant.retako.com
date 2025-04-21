module.exports = (sequelize, Sequelize) => {
  const ReportLog = sequelize.define("report_log", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reportId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'reports',
        key: 'id'
      }
    },
    action: {
      type: Sequelize.STRING(50), // SENT_TO_LANDLORD, VIEWED_BY_LANDLORD, etc.
      allowNull: false
    },
    timestamp: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    details: {
      type: Sequelize.TEXT, // Extra details as JSON
      allowNull: true
    }
  });

  return ReportLog;
};