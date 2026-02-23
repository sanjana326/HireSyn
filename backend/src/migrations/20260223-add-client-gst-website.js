const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("clients").catch(() => null);
    if (!tableInfo) return;
    if (!tableInfo.gst_number) {
      await queryInterface.addColumn("clients", "gst_number", {
        type: DataTypes.STRING(30),
        allowNull: true,
      });
    }
    if (!tableInfo.website) {
      await queryInterface.addColumn("clients", "website", {
        type: DataTypes.STRING(255),
        allowNull: true,
      });
    }
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("clients").catch(() => null);
    if (!tableInfo) return;
    if (tableInfo.gst_number) {
      await queryInterface.removeColumn("clients", "gst_number");
    }
    if (tableInfo.website) {
      await queryInterface.removeColumn("clients", "website");
    }
  },
};
