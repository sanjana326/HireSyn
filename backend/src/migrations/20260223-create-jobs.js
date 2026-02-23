const { DataTypes } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const exists = await queryInterface.describeTable("jobs").catch(() => null);
    if (exists) return;
    await queryInterface.createTable("jobs", {
      job_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      job_title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      skills: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      job_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      openings: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      exp_range: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      budget_type: {
        type: DataTypes.ENUM("Zero", "Both"),
        allowNull: true,
      },
      engagement_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      requirement_source: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      received_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deadline: {
        type: DataTypes.DATE,
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
    await queryInterface.dropTable("jobs").catch(() => {});
  },
};
