const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    await queryInterface.changeColumn("users", "role", {
      type: DataTypes.ENUM("superadmin", "admin"),
      allowNull: false,
      defaultValue: "admin",
    });
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    await queryInterface.changeColumn("users", "role", {
      type: DataTypes.ENUM("admin"),
      allowNull: false,
      defaultValue: "admin",
    });
  },
};
