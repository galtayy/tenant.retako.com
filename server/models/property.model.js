module.exports = (sequelize, Sequelize) => {
  const Property = sequelize.define("property", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    },
    postalCode: {
      type: Sequelize.STRING,
      allowNull: true
    },
    type: {
      type: Sequelize.STRING, // apartment, house, etc.
      allowNull: false
    },
    rentalPeriod: {
      type: Sequelize.INTEGER, // Rental period (in months)
      allowNull: true,
      defaultValue: 12
    },
    depositAmount: {
      type: Sequelize.DECIMAL(10, 2), // Deposit amount
      allowNull: true,
      defaultValue: 0
    },
    roomCount: {
      type: Sequelize.INTEGER, // Number of rooms
      allowNull: true,
      defaultValue: 1
    },
    bathroomCount: {
      type: Sequelize.INTEGER, // Number of bathrooms
      allowNull: true,
      defaultValue: 1
    },
    amenities: {
      type: Sequelize.TEXT, // Facilities/features (stored as JSON)
      allowNull: true
    },
    landlordName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    landlordEmail: {
      type: Sequelize.STRING,
      allowNull: false
    },
    landlordPhone: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });

  return Property;
};
