const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vendor = sequelize.define(
  "Vendor",
  {
    vendor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
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
  },
  {
    tableName: "vendors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Vendor;
