const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    if (!tableInfo.deleted) {
      await queryInterface.addColumn("users", "deleted", {
        type: DataTypes.DATE,
        allowNull: true,
      });
    }
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    if (tableInfo.deleted) {
      await queryInterface.removeColumn("users", "deleted");
    }
  },
};
