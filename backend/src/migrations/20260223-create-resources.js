const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const exists = await queryInterface.describeTable("resources").catch(() => null);
    if (exists) return;
    await queryInterface.createTable("resources", {
      resource_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },
  down: async ({ queryInterface }) => {
    await queryInterface.dropTable("resources").catch(() => {});
  },
};
