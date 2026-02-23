const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const exists = await queryInterface.describeTable("client_contacts").catch(() => null);
    if (exists) return;
    await queryInterface.createTable("client_contacts", {
      contact_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },
  down: async ({ queryInterface }) => {
    await queryInterface.dropTable("client_contacts").catch(() => {});
  },
};
