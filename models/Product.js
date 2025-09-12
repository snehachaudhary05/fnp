const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Product = sequelize.define("Product", {
  tenantId: { type: DataTypes.STRING, allowNull: false },
  shopifyId: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT },
  currency: { type: DataTypes.STRING, defaultValue: "USD" },
  inventoryQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  variantId: { type: DataTypes.STRING }
}, {
  tableName: "products",
  timestamps: false,
  indexes: [
    { unique: true, fields: ["tenantId", "shopifyId"] }
  ]
});
module.exports = Product;
