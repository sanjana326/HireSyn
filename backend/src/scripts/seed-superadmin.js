const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { sequelize, User } = require("../models");
const bcrypt = require("bcryptjs");

async function main() {
  const email = "superadmin@c2c.com";
  const existing = await User.findOne({ where: { email }, paranoid: false });
  if (existing && existing.role === "superadmin") {
    if (existing.deleted) await existing.restore();
    if (!existing.status) await existing.update({ status: true });
    console.log("Superadmin already exists:", email);
  } else if (existing) {
    await existing.update({ role: "superadmin", status: true, deleted: null });
    console.log("Promoted existing user to superadmin:", email);
  } else {
    const hash = await bcrypt.hash("Super@123!", 12);
    const now = new Date();
    await User.create({
      name: "Super Admin",
      email,
      password: hash,
      role: "superadmin",
      status: true,
      created_at: now,
      updated_at: now,
    });
    console.log("Created superadmin:", email);
  }
}

main()
  .then(async () => { await sequelize.close(); })
  .catch(async (e) => {
    console.error(e && e.message ? e.message : String(e));
    try { await sequelize.close(); } catch {}
    process.exit(1);
  });
