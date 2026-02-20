const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const sequelize = require("../config/database");

async function main() {
  const queryInterface = sequelize.getQueryInterface();
  const seeder = require("../seeders/admin.seeder");
  await seeder.up(queryInterface);
  await sequelize.close();
  console.log("Admin seeder executed");
}

main().catch(async (e) => {
  if (e && e.message) console.error(e.message);
  try {
    await sequelize.close();
  } catch {}
  process.exit(1);
});
