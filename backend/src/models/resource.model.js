const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Resource = sequelize.define(
  "Resource",
  {
    resource_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    resource_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    monthly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    availability: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    job_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    resume_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "resources",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Resource;
