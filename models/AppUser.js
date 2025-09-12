// models/AppUser.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const AppUser = sequelize.define("AppUser", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tenantId: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
});

module.exports = AppUser;
