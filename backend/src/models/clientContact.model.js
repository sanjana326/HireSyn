const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClientContact = sequelize.define(
  "ClientContact",
  {
    contact_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "client_contacts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ClientContact;
