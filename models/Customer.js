const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Customer = sequelize.define("Customer", {
  tenantId: { type: DataTypes.STRING, allowNull: false },
  shopifyId: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING }, // Added for authentication
  totalSpent: { type: DataTypes.FLOAT, defaultValue: 0 },
  ordersCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: "customers",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["tenantId", "shopifyId"] },
    { fields: ["shopifyId"] } // Needed for FK
  ]
});

module.exports = Customer;
