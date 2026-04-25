import express from "express";
import {
  getParkingSpots,
  getParkingSpotById,
  getAvailability,
} from "../controllers/parkingController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/spots", authenticateToken, getParkingSpots);
router.get("/spots/:id", authenticateToken, getParkingSpotById);
router.get("/availability/:id", authenticateToken, getAvailability);

export default router;
