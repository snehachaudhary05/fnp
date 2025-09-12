// models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Order = sequelize.define("Order", {
  tenantId: { type: DataTypes.STRING, allowNull: false },
  shopifyId: { type: DataTypes.STRING, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING },
  orderDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING },
  customerShopifyId: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "orders",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["tenantId", "shopifyId"] },
    { fields: ["customerShopifyId"] }
  ]
});

module.exports = Order;
