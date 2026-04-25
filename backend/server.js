import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import parkingRoutes from './routes/parking.js';
import bookingRoutes from './routes/booking.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';  // ✅ Payment route import

dotenv.config();

const app = express();  // ✅ Pehle app banao
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes – YAHAN app.use lagaao
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);  // ✅ Payment route register

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});