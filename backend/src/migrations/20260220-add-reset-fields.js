const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    if (!tableInfo.reset_token) {
      await queryInterface.addColumn("users", "reset_token", {
        type: DataTypes.STRING(255),
        allowNull: true,
      });
    }
    if (!tableInfo.reset_token_expiry) {
      await queryInterface.addColumn("users", "reset_token_expiry", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    if (tableInfo.reset_token) {
      await queryInterface.removeColumn("users", "reset_token");
    }
    if (tableInfo.reset_token_expiry) {
      await queryInterface.removeColumn("users", "reset_token_expiry");
    }
  },
};
