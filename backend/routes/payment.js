import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/db.js';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
    console.log('RAZORPAY_KEY_SECRET length:', process.env.RAZORPAY_KEY_SECRET?.length);
});

// Verify payment and save booking
router.post('/verify', authenticateToken, async (req, res) => {
    try {
        const { order_id, payment_id, signature, bookingData } = req.body;
        const { spot_id, start_time, duration, vehicle_number, total_amount } = bookingData;
        const user_id = req.user.id;

        // Verify signature
        const body = order_id + '|' + payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // Save booking in database
        const end_time = new Date(start_time);
        end_time.setHours(end_time.getHours() + parseInt(duration));

        const bookingResult = await pool.query(
            `INSERT INTO bookings (user_id, spot_id, start_time, end_time, duration, vehicle_number, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [user_id, spot_id, start_time, end_time, duration, vehicle_number, total_amount, 'confirmed']
        );

        // Decrease available spots
        await pool.query('UPDATE parking_spots SET available_spots = available_spots - 1 WHERE id = $1', [spot_id]);

        res.json({ success: true, message: 'Payment verified, booking confirmed', booking: bookingResult.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

export default router;