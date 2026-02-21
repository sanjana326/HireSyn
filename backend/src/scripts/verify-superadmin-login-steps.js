const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { sequelize, User } = require("../models");
const bcrypt = require("bcryptjs");

(async () => {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email: "superadmin@c2c.com" }, paranoid: false });
  console.log("exists:", !!user);
  if (!user) return;
  console.log("users_id:", user.users_id, "role:", user.role, "status:", user.status, "deleted:", !!user.deleted);
  const ok = await bcrypt.compare("Super@123!", user.password);
  console.log("password ok:", ok);
  await sequelize.close();
})().catch(async (e) => {
  console.error("error:", e && e.message ? e.message : String(e));
  try { await sequelize.close(); } catch {}
  process.exit(1);
});
