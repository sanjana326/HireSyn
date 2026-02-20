const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    if (tableInfo.createdAt && !tableInfo.created_at) {
      await queryInterface.changeColumn("users", "createdAt", {
        type: DataTypes.DATE,
        allowNull: false,
      });
      await queryInterface.renameColumn("users", "createdAt", "created_at");
    }
    if (tableInfo.updatedAt && !tableInfo.updated_at) {
      await queryInterface.changeColumn("users", "updatedAt", {
        type: DataTypes.DATE,
        allowNull: false,
      });
      await queryInterface.renameColumn("users", "updatedAt", "updated_at");
    }
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    if (tableInfo.created_at && !tableInfo.createdAt) {
      await queryInterface.renameColumn("users", "created_at", "createdAt");
    }
    if (tableInfo.updated_at && !tableInfo.updatedAt) {
      await queryInterface.renameColumn("users", "updated_at", "updatedAt");
    }
  },
};
