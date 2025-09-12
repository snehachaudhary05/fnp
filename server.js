const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./db");
const ingestRoutes = require("./routes/ingest");
const metricsRoutes = require("./routes/metrics");
const authRoutes = require("./routes/auth");
const { Customer, Order, Product } = require("./models/Associations");
const app = express();
app.use(cors());
app.use(express.json());
const customerWebhook = require("./routes/webhooks/customers");
const orderWebhook = require("./routes/webhooks/orders");
const productWebhook = require("./routes/webhooks/products");

app.use("/webhook/customers", customerWebhook);
app.use("/webhook/orders", orderWebhook);
app.use("/webhook/products", productWebhook);

// Routes
app.use("/ingest", ingestRoutes);
app.use("/metrics", metricsRoutes);
app.use("/auth", authRoutes);
app.get("/", (req, res) => res.json({ status: "✅ Service is running" }));
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Force recreate tables (for dev only!)
    await sequelize.sync({ alter: true });
    console.log("✅ Models synced successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
})();
