module.exports = (sequelize, Sequelize) => {
  const Report = sequelize.define("report", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reportType: {
      type: Sequelize.ENUM('move-in', 'move-out'),
      allowNull: false,
      defaultValue: 'move-in'
    },
    reportDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    accessToken: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    status: {
      type: Sequelize.ENUM('draft', 'sent', 'viewed'),
      allowNull: false,
      defaultValue: 'draft'
    },
    lastViewed: {
      type: Sequelize.DATE,
      allowNull: true
    },
    additionalNotes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    walkthrough: {
      type: Sequelize.TEXT, // Walkthrough information stored as JSON
      allowNull: true
    },
    pdfUrl: {
      type: Sequelize.STRING(255), // PDF report URL
      allowNull: true
    },
    reportSent: {
      type: Sequelize.DATE, // Date when report was sent
      allowNull: true
    },
    reportViewed: {
      type: Sequelize.DATE, // Date when report was viewed
      allowNull: true
    }
  });

  return Report;
};