const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Client = sequelize.define(
  "Client",
  {
    client_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
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
    gst_number: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: "clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Client;
