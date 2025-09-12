const AppUser = require("./AppUser");
const Customer = require("./Customer");
const Order = require("./Order");

// Customer ↔ Order
Customer.hasMany(Order, { foreignKey: "customerShopifyId", sourceKey: "shopifyId" });
Order.belongsTo(Customer, { foreignKey: "customerShopifyId", targetKey: "shopifyId" });

module.exports = { AppUser, Customer, Order };
