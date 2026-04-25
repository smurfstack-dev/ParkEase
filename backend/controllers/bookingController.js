import pool from "../config/db.js";

export const createBooking = async (req, res) => {
  try {
    const { spot_id, start_time, duration, vehicle_number, total_amount } =
      req.body;
    const user_id = req.user.id;

    if (
      !spot_id ||
      !start_time ||
      !duration ||
      !vehicle_number ||
      !total_amount
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const spotResult = await pool.query(
      "SELECT * FROM parking_spots WHERE id = $1 AND is_active = true",
      [spot_id],
    );

    if (spotResult.rows.length === 0) {
      return res.status(404).json({ message: "Parking spot not found" });
    }

    const spot = spotResult.rows[0];

    if (spot.available_spots <= 0) {
      return res.status(400).json({ message: "No spots available" });
    }

    const end_time = new Date(start_time);
    end_time.setHours(end_time.getHours() + parseInt(duration));

    const bookingResult = await pool.query(
      `INSERT INTO bookings 
             (user_id, spot_id, start_time, end_time, duration, vehicle_number, total_amount, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
      [
        user_id,
        spot_id,
        start_time,
        end_time,
        duration,
        vehicle_number,
        total_amount,
        "confirmed",
      ],
    );

    await pool.query(
      "UPDATE parking_spots SET available_spots = available_spots - 1 WHERE id = $1",
      [spot_id],
    );

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      booking: bookingResult.rows[0],
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT b.*, ps.name as spot_name, ps.address, ps.price_per_hour 
             FROM bookings b 
             JOIN parking_spots ps ON b.spot_id = ps.id 
             WHERE b.user_id = $1 
             ORDER BY b.created_at DESC`,
      [user_id],
    );

    res.json({
      success: true,
      count: result.rows.length,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking_id = req.params.id;
    const user_id = req.user.id;

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE id = $1 AND user_id = $2",
      [booking_id, user_id],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [
      "cancelled",
      booking_id,
    ]);
    await pool.query(
      "UPDATE parking_spots SET available_spots = available_spots + 1 WHERE id = $1",
      [booking.spot_id],
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
