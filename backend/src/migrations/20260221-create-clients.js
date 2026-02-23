const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const exists = await queryInterface.describeTable("clients").catch(() => null);
    if (exists) return;
    await queryInterface.createTable("clients", {
      client_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      organization_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      contact: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      handled_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
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
    await queryInterface.dropTable("clients").catch(() => {});
  },
};
