import express from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authenticateToken, createBooking);
router.get("/my-bookings", authenticateToken, getMyBookings);
router.put("/cancel/:id", authenticateToken, cancelBooking);

export default router;
