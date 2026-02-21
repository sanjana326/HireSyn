const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const sequelize = require("../config/database");

async function main() {
  await sequelize.query("UPDATE `users` SET `role` = 'superadmin' WHERE `email` = 'superadmin@c2c.com'");
  console.log("SQL updated role to superadmin for superadmin@c2c.com");
}

main()
  .then(async () => { await sequelize.close(); })
  .catch(async (e) => {
    console.error(e && e.message ? e.message : String(e));
    try { await sequelize.close(); } catch {}
    process.exit(1);
  });
