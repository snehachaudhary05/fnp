const express = require("express");
const { Op, fn, col } = require("sequelize");
const { Customer, Order } = require("../models/Associations");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Protect all /metrics routes
router.use(authMiddleware);

// ------------------ SUMMARY ------------------
router.get("/", async (req, res) => {
  const tenantId = req.query.tenantId || req.user.tenantId; // fallback to logged-in tenant
  if (!tenantId) return res.status(400).json({ error: "tenantId required" });

  try {
    const totalCustomers = await Customer.count({ where: { tenantId } });
    const totalOrders = await Order.count({ where: { tenantId } });
    const totalRevenue =
      (await Order.sum("totalPrice", { where: { tenantId } })) || 0;

    const topCustomers = await Customer.findAll({
      where: { tenantId },
      attributes: ["name", "email", "totalSpent"],
      order: [["totalSpent", "DESC"]],
      limit: 5,
      raw: true,
    });

    res.json({ totalCustomers, totalOrders, totalRevenue, topCustomers });
  } catch (err) {
    console.error("❌ Metrics error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ------------------ TRENDS ------------------
router.get("/trends", async (req, res) => {
  const tenantId = req.query.tenantId || req.user.tenantId;
  const { startDate, endDate } = req.query;
  if (!tenantId) return res.status(400).json({ error: "tenantId required" });

  let where = { tenantId };
  if (startDate && endDate) {
    where.orderDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  }

  try {
    const results = await Order.findAll({
      where,
      attributes: [
        [fn("DATE", col("orderDate")), "date"],
        [fn("COUNT", col("id")), "orders"],
        [fn("SUM", col("totalPrice")), "revenue"],
      ],
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    });

    res.json(results);
  } catch (err) {
    console.error("❌ Trends error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
