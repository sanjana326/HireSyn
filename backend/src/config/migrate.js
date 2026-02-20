const fs = require("fs");
const path = require("path");
const sequelize = require("./database");

async function runMigrations() {
  const queryInterface = sequelize.getQueryInterface();
  const migrationsDir = path.join(__dirname, "..", "migrations");
  if (!fs.existsSync(migrationsDir)) return;
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js"))
    .sort();

  for (const file of files) {
    const full = path.join(migrationsDir, file);
    console.log(`Running migration: ${file}`);
    const migration = require(full);
    if (typeof migration.up === "function") {
      try {
        await migration.up({ queryInterface });
        console.log(`Migration completed: ${file}`);
      } catch (e) {
        console.error(`Migration failed: ${file}`);
        if (e && e.message) console.error(e.message);
        throw e;
      }
    }
  }
}

module.exports = { runMigrations };
