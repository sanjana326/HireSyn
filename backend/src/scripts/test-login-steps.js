const { sequelize, User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

(async () => {
  await sequelize.authenticate();
  const admin = await User.findOne({ where: { email: "admin@c2c.com" } });
  console.log("admin exists:", !!admin);
  if (!admin) return;
  console.log("users_id:", admin.users_id, "role:", admin.role);
  const ok = await bcrypt.compare("Admin@123", admin.password);
  console.log("password ok:", ok);
  if (!ok) return;
  const token = jwt.sign({ users_id: admin.users_id, role: admin.role }, "dev_secret", { expiresIn: "8h" });
  console.log("token length:", token.length);
  await sequelize.close();
})().catch(async (e) => {
  console.error("error:", e && e.message ? e.message : String(e));
  try { await sequelize.close(); } catch {}
  process.exit(1);
});
