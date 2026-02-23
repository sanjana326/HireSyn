const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { sequelize, User } = require("../models");

async function main() {
  const qi = sequelize.getQueryInterface();
  const info = await qi.describeTable("users").catch(() => null);
  if (info) {
    console.log("USERS_COLUMNS:", Object.keys(info));
  } else {
    console.log("USERS_COLUMNS: <unavailable>");
  }
  const cinfo = await qi.describeTable("clients").catch(() => null);
  if (cinfo) {
    console.log("CLIENTS_COLUMNS:", Object.keys(cinfo));
  } else {
    console.log("CLIENTS_COLUMNS: <unavailable>");
  }
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
