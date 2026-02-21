const { DataTypes, Sequelize } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("vendors").catch(() => null);
    if (tableInfo) return;
    await queryInterface.createTable("vendors", {
      vendor_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      representative_name: {
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
      budget_type: {
        type: DataTypes.ENUM("Zero", "Both"),
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("vendors", {
      fields: ["handled_by"],
      type: "foreign key",
      name: "fk_vendors_handled_by_users",
      references: {
        table: "users",
        field: "users_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.addIndex("vendors", ["email"], { name: "idx_vendors_email" });
    await queryInterface.addIndex("vendors", ["representative_name"], { name: "idx_vendors_rep_name" });
    await queryInterface.addIndex("vendors", ["organization_name"], { name: "idx_vendors_org_name" });
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("vendors").catch(() => null);
    if (!tableInfo) return;
    await queryInterface.dropTable("vendors");
  },
};
