// server.js
const express = require("express");
const cors = require("cors");

// ✅ Load dotenv only in local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const sequelize = require("./db");
const ingestRoutes = require("./routes/ingest");
const metricsRoutes = require("./routes/metrics");
const authRoutes = require("./routes/auth");
const { Customer, Order, Product } = require("./models/Associations");

const customerWebhook = require("./routes/webhooks/customers");
const orderWebhook = require("./routes/webhooks/orders");
const productWebhook = require("./routes/webhooks/products");

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: "https://fnp-frontend-git-main-snehachaudhary05s-projects.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

// --- Webhook Routes ---
app.use("/webhook/customers", customerWebhook);
app.use("/webhook/orders", orderWebhook);
app.use("/webhook/products", productWebhook);

// --- API Routes ---
app.use("/ingest", ingestRoutes);
app.use("/metrics", metricsRoutes);
app.use("/auth", authRoutes);

// --- Health Check ---
app.get("/", (req, res) => res.json({ status: "✅ Service is running" }));

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // ✅ Authenticate database
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // ✅ Sync models (use alter: true for dev, migrations for prod)
    await sequelize.sync({ alter: true });
    console.log("✅ Models synced successfully");

    // ✅ Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1); // Exit if DB connection fails
  }
})();
