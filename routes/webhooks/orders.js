const express = require("express");
const router = express.Router();
const { Order } = require("../../models/Associations");

router.post("/", async (req, res) => {
  const order = req.body;

  try {
    await Order.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: order.id.toString(),
      customerShopifyId: order.customer.id.toString(),
      totalPrice: parseFloat(order.total_price) || 0,
      currency: order.currency || "USD",
      orderDate: order.created_at ? new Date(order.created_at) : new Date(),
    });
    res.status(200).send("Order synced");
  } catch (err) {
    console.error("Order webhook error:", err);
    res.status(500).send("Error syncing order");
  }
});

module.exports = router;
