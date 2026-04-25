import express from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "parkease_super_secret_key_2024";

// Simple token verification
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// ADMIN LOGIN - Simplified and Working
router.post("/login", async (req, res) => {
  console.log("🔐 Admin login attempt:", req.body);

  try {
    const { email, password } = req.body;

    // Hardcoded admin check
    if (email === "admin@parkease.com" && password === "admin123") {
      const token = jwt.sign(
        { id: 1, email: email, name: "Super Admin", role: "admin" },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      console.log("✅ Admin login successful");
      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        admin: { id: 1, name: "Super Admin", email: email },
      });
    } else {
      console.log("❌ Admin login failed: Invalid credentials");
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all parking spots
router.get("/spots", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, address, city, latitude, longitude, price_per_hour, total_spots, available_spots, rating, is_active, created_at FROM parking_spots ORDER BY created_at DESC",
    );
    res.json({ success: true, spots: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add new parking spot
router.post("/spots", verifyToken, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      latitude,
      longitude,
      price_per_hour,
      total_spots,
      rating,
    } = req.body;
    const result = await pool.query(
      `INSERT INTO parking_spots (name, address, city, latitude, longitude, price_per_hour, total_spots, available_spots, rating, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING *`,
      [
        name,
        address,
        city || "",
        latitude,
        longitude,
        price_per_hour,
        total_spots,
        total_spots,
        rating || 4.0,
      ],
    );
    res
      .status(201)
      .json({
        success: true,
        spot: result.rows[0],
        message: "Parking spot added!",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete parking spot
router.delete("/spots/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM parking_spots WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ success: true, message: "Spot deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all bookings
router.get("/bookings", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as user_name, ps.name as spot_name 
             FROM bookings b 
             JOIN users u ON b.user_id = u.id 
             JOIN parking_spots ps ON b.spot_id = ps.id 
             ORDER BY b.created_at DESC`,
    );
    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all users
router.get("/users", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Update parking spot
router.put('/spots/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, city, latitude, longitude, price_per_hour, total_spots, available_spots, rating, is_active } = req.body;
        
        const result = await pool.query(
            `UPDATE parking_spots 
             SET name = $1, address = $2, city = $3, latitude = $4, longitude = $5, 
                 price_per_hour = $6, total_spots = $7, available_spots = $8, rating = $9, is_active = $10
             WHERE id = $11 RETURNING *`,
            [name, address, city, latitude, longitude, price_per_hour, total_spots, available_spots, rating, is_active, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Spot not found' });
        }
        
        res.json({ success: true, spot: result.rows[0], message: 'Spot updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
