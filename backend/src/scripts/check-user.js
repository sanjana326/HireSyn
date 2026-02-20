const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { sequelize, User } = require("../models");

async function main() {
  const targetEmail = (process.argv[2] || "admin@c2c.com").trim().toLowerCase();
  const user = await User.findOne({ where: { email: targetEmail } });
  if (!user) {
    console.log("NOT FOUND:", targetEmail);
  } else {
    console.log("FOUND:", {
      users_id: user.users_id,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  }
  await sequelize.close();
}

main().catch(async (e) => {
  if (e && e.message) console.error(e.message);
  try { await sequelize.close(); } catch {}
  process.exit(1);
});
