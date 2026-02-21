const sequelize = require("../config/database");
const User = require("./user.model");
const Vendor = require("./vendor.model");

Vendor.belongsTo(User, { foreignKey: "handled_by" });
User.hasMany(Vendor, { foreignKey: "handled_by" });

module.exports = {
  sequelize,
  User,
  Vendor,
};
