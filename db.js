const { Sequelize } = require("sequelize");
require("dotenv").config(); // load .env

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: console.log // prints raw SQL queries
  }
);

// Test DB connection
sequelize.authenticate()
  .then(() => {
    console.log("✅ Connected to DB:", sequelize.config.database);
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err); // logs full error object
  });

module.exports = sequelize;
