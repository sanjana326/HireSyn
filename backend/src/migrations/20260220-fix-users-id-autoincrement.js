const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo || !tableInfo.users_id) return;
    await queryInterface.changeColumn("users", "users_id", {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
    });
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo || !tableInfo.users_id) return;
    await queryInterface.changeColumn("users", "users_id", {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    });
  },
};
