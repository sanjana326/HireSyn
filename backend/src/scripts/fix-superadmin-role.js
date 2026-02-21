const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { sequelize, User } = require("../models");

async function main() {
  const email = "superadmin@c2c.com";
  const user = await User.findOne({ where: { email }, paranoid: false });
  if (!user) {
    console.log("Superadmin user not found:", email);
    return;
  }
  await user.update({ role: "superadmin", status: true });
  console.log("Updated role to superadmin for:", email);
}

main()
  .then(async () => { await sequelize.close(); })
  .catch(async (e) => {
    console.error(e && e.message ? e.message : String(e));
    try { await sequelize.close(); } catch {}
    process.exit(1);
  });
