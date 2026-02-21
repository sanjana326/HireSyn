const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { sequelize, User } = require("../models");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function main() {
  const list =
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
  const single = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const emails = list.length > 0 ? list : (single ? [single] : []);
  if (emails.length === 0) {
    console.log("No ADMIN_EMAILS/ADMIN_EMAIL configured");
    return;
  }
  const hash = await bcrypt.hash("Admin@123", 10);
  for (const email of emails) {
    const existing = await User.findOne({ where: { email }, paranoid: false });
    if (!existing) {
      const now = new Date();
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await User.create({
        name: email.split("@")[0],
        email,
        password: hash,
        role: "admin",
        status: true,
        reset_token: resetToken,
        reset_token_expiry: resetExp,
        created_at: now,
        updated_at: now,
      });
      console.log("Created admin:", email);
    } else {
      if (existing.deleted) {
        await existing.restore();
      }
      if (!existing.status) {
        await existing.update({ status: true });
      }
      await existing.update({ password: hash });
      console.log("Updated password for admin:", email);
    }
  }
}

main()
  .then(async () => { await sequelize.close(); })
  .catch(async (e) => {
    console.error(e && e.message ? e.message : String(e));
    try { await sequelize.close(); } catch {}
    process.exit(1);
  });
