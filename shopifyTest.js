// shopifyTest.js
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const axios = require("axios");
require("dotenv").config(); // load .env

// --- MySQL Setup ---
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);

// Test DB connection
sequelize.authenticate()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });

// --- Define Models ---
const Customer = sequelize.define(
  "Customer",
  {
    tenantId: { type: DataTypes.STRING, allowNull: false },
    shopifyId: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    totalSpent: DataTypes.FLOAT,
    ordersCount: DataTypes.INTEGER,
  },
  { timestamps: false }
);

const Order = sequelize.define(
  "Order",
  {
    tenantId: { type: DataTypes.STRING, allowNull: false },
    shopifyId: { type: DataTypes.STRING, unique: true, allowNull: false },
    customerShopifyId: { type: DataTypes.STRING, allowNull: false },
    totalPrice: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    orderDate: DataTypes.DATE,
  },
  { timestamps: false }
);

const Product = sequelize.define(
  "Product",
  {
    tenantId: { type: DataTypes.STRING, allowNull: false },
    shopifyId: { type: DataTypes.STRING, unique: true, allowNull: false },
    title: DataTypes.STRING,
    price: DataTypes.FLOAT,
    inventory: DataTypes.INTEGER,
  },
  { timestamps: false }
);

// --- Shopify Axios Helper ---
const SHOPIFY_DOMAIN = process.env.SHOP_NAME; // from .env
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function shopifyGet(path, params = {}) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2025-01/${path}.json`;
  const res = await axios.get(url, {
    headers: { "X-Shopify-Access-Token": ACCESS_TOKEN },
    params,
  });
  return res.data;
}

// --- Sync Tables ---
async function syncTables() {
  await sequelize.sync({ alter: { dropForeignKeys: false } });

  console.log("✅ Database tables ready.");
}

// --- Sync Customers ---
async function syncCustomers() {
  const customersRes = await shopifyGet("customers", { limit: 250 });
  for (const cust of customersRes.customers) {
    await Customer.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: cust.id.toString(),
      name: `${cust.first_name || ""} ${cust.last_name || ""}`.trim(),
      email: cust.email,
      totalSpent: parseFloat(cust.total_spent) || 0,
      ordersCount: cust.orders_count || 0,
    });
  }
  console.log(`✅ Synced ${customersRes.customers.length} customers`);
}

// --- Sync Orders ---
async function syncOrders() {
  const ordersRes = await shopifyGet("orders", { limit: 250 });
  for (const ord of ordersRes.orders) {
    await Order.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: ord.id.toString(),
      customerShopifyId: ord.customer?.id?.toString() || "0",
      totalPrice: parseFloat(ord.total_price) || 0,
      currency: ord.currency || "USD",
      orderDate: ord.created_at ? new Date(ord.created_at) : new Date(),
    });
  }
  console.log(`✅ Synced ${ordersRes.orders.length} orders`);
}

// --- Sync Products ---
async function syncProducts() {
  const productsRes = await shopifyGet("products", { limit: 250 });
  for (const prod of productsRes.products) {
    await Product.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: prod.id.toString(),
      title: prod.title,
      price: parseFloat(prod.variants[0]?.price) || 0,
      inventory: prod.variants[0]?.inventory_quantity || 0,
    });
  }
  console.log(`✅ Synced ${productsRes.products.length} products`);
}

// --- Express server for webhooks ---
const app = express();
app.use(express.json());

app.post("/webhook/customers", async (req, res) => {
  const cust = req.body;
  try {
    await Customer.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: cust.id.toString(),
      name: `${cust.first_name || ""} ${cust.last_name || ""}`.trim(),
      email: cust.email,
      totalSpent: parseFloat(cust.total_spent) || 0,
      ordersCount: cust.orders_count || 0,
    });
    console.log("Customer synced via webhook:", cust.email);
    res.status(200).send("Customer synced");
  } catch (err) {
    console.error("Customer webhook error:", err);
    res.status(500).send("Error syncing customer");
  }
});

app.post("/webhook/orders", async (req, res) => {
  const ord = req.body;
  try {
    await Order.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: ord.id.toString(),
      customerShopifyId: ord.customer?.id?.toString() || "0",
      totalPrice: parseFloat(ord.total_price) || 0,
      currency: ord.currency || "USD",
      orderDate: ord.created_at ? new Date(ord.created_at) : new Date(),
    });
    console.log("Order synced via webhook:", ord.id);
    res.status(200).send("Order synced");
  } catch (err) {
    console.error("Order webhook error:", err);
    res.status(500).send("Error syncing order");
  }
});

app.post("/webhook/products", async (req, res) => {
  const prod = req.body;
  try {
    await Product.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: prod.id.toString(),
      title: prod.title,
      price: parseFloat(prod.variants[0]?.price) || 0,
      inventory: prod.variants[0]?.inventory_quantity || 0,
    });
    console.log("Product synced via webhook:", prod.title);
    res.status(200).send("Product synced");
  } catch (err) {
    console.error("Product webhook error:", err);
    res.status(500).send("Error syncing product");
  }
});

// --- Run initial sync and start server ---
(async () => {
  try {
    await syncTables();
    await syncCustomers();
    await syncOrders();
    await syncProducts();
    console.log("✅ Initial Shopify sync completed");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running and waiting for webhooks on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error initializing Shopify sync:", err);
  }
})();