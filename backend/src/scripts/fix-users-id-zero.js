const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const sequelize = require("../config/database");

async function main() {
  try {
    await sequelize.query("DELETE FROM `users` WHERE `users_id` = 0");
    const queryInterface = sequelize.getQueryInterface();
    const seeder = require("../seeders/admin.seeder");
    await seeder.up(queryInterface);
    console.log("Cleanup complete: removed users_id=0 and re-seeded admin if missing");
  } finally {
    await sequelize.close();
  }
}

main().catch(async (e) => {
  if (e && e.message) console.error(e.message);
  try {
    await sequelize.close();
  } catch {}
  process.exit(1);
});
