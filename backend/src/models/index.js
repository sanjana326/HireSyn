const sequelize = require("../config/database");
const User = require("./user.model");
const Vendor = require("./vendor.model");
const Client = require("./client.model");
const ClientContact = require("./clientContact.model");

Vendor.belongsTo(User, { foreignKey: "handled_by" });
User.hasMany(Vendor, { foreignKey: "handled_by" });
Client.belongsTo(User, { foreignKey: "handled_by" });
User.hasMany(Client, { foreignKey: "handled_by" });
ClientContact.belongsTo(Client, { foreignKey: "client_id" });
Client.hasMany(ClientContact, { foreignKey: "client_id" });

module.exports = {
  sequelize,
  User,
  Vendor,
  Client,
  ClientContact,
};
