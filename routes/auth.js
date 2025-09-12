const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppUser = require("../models/AppUser"); // Dashboard users
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET not defined in .env");
}

// -------------------- REGISTER --------------------
router.post("/register", async (req, res) => {
  const { tenantId, name, email, password } = req.body;

  if (!tenantId || !email || !password) {
    return res
      .status(400)
      .json({ error: "tenantId, email, and password are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await AppUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create AppUser
    const user = await AppUser.create({
      tenantId,
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, userId: user.id, message: "User registered" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await AppUser.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
