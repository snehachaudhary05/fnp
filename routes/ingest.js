const express = require("express");
const axios = require("axios");
const { Customer, Order, Product } = require("../models");

const router = express.Router();

/**
 * Ingest Customers
 */
router.post("/customers", async (req, res) => {
  const { tenantId, shopDomain, accessToken } = req.body;
  try {
    const response = await axios.get(
      `https://${shopDomain}/admin/api/2025-01/customers.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    for (const c of response.data.customers) {
      await Customer.upsert(
        {
          tenantId,
          shopifyId: c.id.toString(),
          name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
          email: c.email || "",
          totalSpent: parseFloat(c.total_spent) || 0,
          ordersCount: c.orders_count || 0
        },
        { silent: true } // ⚠ Prevent timestamps error
      );
    }

    res.json({ message: "✅ Customers ingested successfully" });
  } catch (err) {
    console.error("❌ Error ingesting customers:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Ingest Products
 */
router.post("/products", async (req, res) => {
  const { tenantId, shopDomain, accessToken } = req.body;
  try {
    const response = await axios.get(
      `https://${shopDomain}/admin/api/2025-01/products.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    for (const p of response.data.products) {
      const variant = p.variants?.[0] || {};
      await Product.upsert(
        {
          tenantId,
          shopifyId: p.id.toString(),
          title: p.title || "",
          price: parseFloat(variant.price) || 0,
          currency: variant.currency || "USD",
          inventoryQuantity: variant.inventory_quantity || 0,
          variantId: variant.id?.toString() || null
        },
        { silent: true } // ⚠ Prevent timestamps error
      );
    }

    res.json({ message: "✅ Products ingested successfully" });
  } catch (err) {
    console.error("❌ Error ingesting products:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Ingest Orders
 */
router.post("/orders", async (req, res) => {
  const { tenantId, shopDomain, accessToken } = req.body;
  try {
    const response = await axios.get(
      `https://${shopDomain}/admin/api/2025-01/orders.json`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    for (const o of response.data.orders) {
      await Order.upsert(
        {
          tenantId,
          shopifyId: o.id.toString(),
          totalPrice: parseFloat(o.total_price) || 0,
          currency: o.currency || "USD",
          orderDate: o.created_at,
          status: o.financial_status || "pending",
          customerShopifyId: o.customer?.id?.toString() || null
        },
        { silent: true } // ⚠ Prevent timestamps error
      );
    }

    res.json({ message: "✅ Orders ingested successfully" });
  } catch (err) {
    console.error("❌ Error ingesting orders:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
