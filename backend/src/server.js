const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = require("./app");
const { sequelize } = require("./models");
const { runMigrations } = require("./config/migrate");
const mysql = require("mysql2/promise");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    console.log("Before DB connection");
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await conn.end();

    await sequelize.authenticate();
    console.log("Database connected successfully");
    await runMigrations();
    console.log("Database migrations executed");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (_) {
    console.error("Server failed to start");
    if (_ && _.message) {
      console.error(_.message);
    }
    process.exit(1);
  }
}

start();
