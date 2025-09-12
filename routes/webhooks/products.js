const express = require("express");
const router = express.Router();
const { Product } = require("../../models/Associations");

router.post("/", async (req, res) => {
  const prod = req.body;

  try {
    await Product.upsert({
      tenantId: "sneha-xeno-store",
      shopifyId: prod.id.toString(),
      title: prod.title,
      price: parseFloat(prod.variants[0].price) || 0,
      inventory: prod.variants[0].inventory_quantity || 0,
    });
    res.status(200).send("Product synced");
  } catch (err) {
    console.error("Product webhook error:", err);
    res.status(500).send("Error syncing product");
  }
});

module.exports = router;
