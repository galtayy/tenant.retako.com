module.exports = (sequelize, Sequelize) => {
  const Photo = sequelize.define("photo", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    filename: {
      type: Sequelize.STRING,
      allowNull: false
    },
    originalName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    path: {
      type: Sequelize.STRING,
      allowNull: false
    },
    size: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    room: {
      type: Sequelize.STRING,
      allowNull: false
    },
    damageDescription: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    damageMarks: {
      type: Sequelize.TEXT, // Markings stored as JSON
      allowNull: true
    },
    damageTypes: {
      type: Sequelize.TEXT, // Damage types stored as JSON
      allowNull: true
    }
  });

  return Photo;
};