const { DataTypes, Sequelize } = require("sequelize");

module.exports = {
  up: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) {
      await queryInterface.createTable("users", {
        users_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM("admin"),
          allowNull: false,
          defaultValue: "admin",
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      });
      return;
    }
    if (tableInfo.id) {
      await queryInterface.renameColumn("users", "id", "users_id");
    }
    if (tableInfo.role) {
      await queryInterface.changeColumn("users", "role", {
        type: DataTypes.ENUM("admin"),
        allowNull: false,
        defaultValue: "admin",
      });
    } else {
      await queryInterface.addColumn("users", "role", {
        type: DataTypes.ENUM("admin"),
        allowNull: false,
        defaultValue: "admin",
      });
    }
    if (tableInfo.isActive) {
      await queryInterface.renameColumn("users", "isActive", "status");
    } else if (!tableInfo.status) {
      await queryInterface.addColumn("users", "status", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
    // keep original timestamp column names to avoid default conflicts
  },
  down: async ({ queryInterface }) => {
    const tableInfo = await queryInterface.describeTable("users").catch(() => null);
    if (!tableInfo) return;
    if (tableInfo.users_id) {
      await queryInterface.renameColumn("users", "users_id", "id");
    }
    if (tableInfo.status) {
      await queryInterface.renameColumn("users", "status", "isActive");
    }
    if (tableInfo.created_at) {
      await queryInterface.renameColumn("users", "created_at", "createdAt");
    }
    if (tableInfo.updated_at) {
      await queryInterface.renameColumn("users", "updated_at", "updatedAt");
    }
    await queryInterface.changeColumn("users", "role", {
      type: DataTypes.ENUM("vendor", "client", "candidate"),
      allowNull: false,
    });
  },
};
