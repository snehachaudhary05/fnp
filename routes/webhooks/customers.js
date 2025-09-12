const express = require("express");
const router = express.Router();
const { Customer } = require("../../models/Associations");

// Shopify webhook: customer created or updated
router.post("/", async (req, res) => {
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
    res.status(200).send("Customer synced");
  } catch (err) {
    console.error("Customer webhook error:", err);
    res.status(500).send("Error syncing customer");
  }
});

module.exports = router;
