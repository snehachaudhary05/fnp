// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Sequelize, DataTypes } = require("sequelize");
const axios = require("axios");
require("dotenv").config();

// --- Database Setup ---
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

// ... your model definitions and Shopify sync functions ...

// --- Express App ---
const app = express();

// ✅ CORS configured for Vercel frontend
app.use(cors({
  origin: "https://fnp-frontend-git-main-snehachaudhary05s-projects.vercel.app",
  credentials: true,
}));

app.use(express.json());

// --- Auth Routes ---
app.post("/auth/register", async (req, res) => {
  const { tenantId, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const hashed = await bcrypt.hash(password, 10);
  try {
    await AppUser.create({ tenantId, email, password: hashed });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await AppUser.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, tenantId: user.tenantId }, "secret", { expiresIn: "1h" });
  res.json({ token });
});

// ... your webhook routes, metrics, health check, and server start ...
