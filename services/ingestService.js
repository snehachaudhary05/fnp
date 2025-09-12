const axios = require("axios");
const { Customer, Order, Product } = require("../models/Associations");
require("dotenv").config();

const SHOP_NAME = "sneha-xeno-store.myshopify.com"; // e.g., sneha-xeno-store.myshopify.com
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Admin API access token
const tenantId = SHOP_NAME.split(".")[0]; // tenant identifier

// Helper function to fetch data from Shopify API
async function fetchShopifyData(endpoint) {
  try {
    const response = await axios.get(
      `https://${SHOP_NAME}/admin/api/2025-07/${endpoint}`,
      {
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(
      `❌ Failed to fetch ${endpoint}:`,
      err.response?.data || err.message
    );
    return null;
  }
}

// Fetch and save customers
async function fetchAndSaveCustomers() {
  const data = await fetchShopifyData("customers.json");
  if (!data) return;

  for (const c of data.customers) {
    try {
      await Customer.upsert({
        tenantId,
        shopifyId: c.id.toString(),
        name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
        email: c.email,
        totalSpent: parseFloat(c.total_spent) || 0,
        ordersCount: c.orders_count || 0,
      });
    } catch (err) {
      console.error("❌ Customer upsert failed:", err.message);
    }
  }

  console.log(
    `✅ ${data.customers.length} customers saved for tenant "${tenantId}"`
  );
}

// Fetch and save orders
async function fetchAndSaveOrders() {
  const data = await fetchShopifyData("orders.json");
  if (!data) return;

  for (const o of data.orders) {
    try {
      await Order.upsert({
        tenantId,
        shopifyId: o.id.toString(),
        totalPrice: parseFloat(o.total_price) || 0,
        currency: o.currency || "USD",
        orderDate: o.created_at,
        status: o.financial_status || "pending",
        customerShopifyId: o.customer?.id?.toString() || null,
      });
    } catch (err) {
      console.error("❌ Order upsert failed:", err.message);
    }
  }

  console.log(
    `✅ ${data.orders.length} orders saved for tenant "${tenantId}"`
  );
}

// Fetch and save products
async function fetchAndSaveProducts() {
  const data = await fetchShopifyData("products.json");
  if (!data) return;

  for (const p of data.products) {
    for (const variant of p.variants || []) {
      try {
        await Product.upsert({
          tenantId,
          shopifyId: p.id.toString(),
          title: p.title || "",
          price: parseFloat(variant.price) || 0,
          inventoryQuantity: variant.inventory_quantity || 0,
          variantId: variant.id?.toString() || null,
        });
      } catch (err) {
        console.error("❌ Product upsert failed:", err.message);
      }
    }
  }

  console.log(
    `✅ ${data.products.length} products saved for tenant "${tenantId}"`
  );
}

// Main ingestion function
async function ingestShopifyData() {
  console.log(`🚀 Starting ingestion for tenant "${tenantId}"...`);
  await fetchAndSaveCustomers();
  await fetchAndSaveOrders();
  await fetchAndSaveProducts();
  console.log(`🎉 Shopify ingestion completed for tenant "${tenantId}"`);
}

module.exports = { ingestShopifyData };
