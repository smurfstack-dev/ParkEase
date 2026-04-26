# 🅿️ ParkEase - Real-Time Parking Space Finder

## 📌 Project Overview

**ParkEase** is a real-time online parking space finder and booking system. Users can search for available parking spots, book slots instantly, make secure payments, and navigate to the parking spot using GPS.

> 🎓 **College Project** - Bachelor of Technology(B.Tech in CSE)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **User Authentication** | Secure JWT-based login/signup |
| 🗺️ **Interactive Maps** | Leaflet.js maps with parking spot markers |
| 📍 **Location Search** | Search parking spots by city (Punjab) |
| 🚗 **Real-time Availability** | Live slot availability with color coding |
| 📅 **Instant Booking** | Book parking slots with date/time |
| 💳 **Payment Gateway** | Razorpay integration |
| 👑 **Admin Panel** | Manage parking spots, view bookings |
| 📱 **Responsive Design** | Works on all devices |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Leaflet.js |
| Backend | Node.js, Express.js, JWT |
| Database | PostgreSQL, Supabase |
| Payment | Razorpay |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 🚀 Live Demo

| Link | URL |
|------|-----|
| Website | https://parkeasefrontend.vercel.app |
| Backend API | https://parkease-backend-u530.onrender.com |

### Test Credentials

**User Login:**
- Email: `test@example.com`
- Password: `123456`

---

## 📁 Project Structure
Parking Finder/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   └── parkingController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── booking.js
│   │   ├── parking.js
│   │   ├── admin.js
│   │   └── payment.js
│   ├── .env
│   └── server.js
│
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── map.css
│   ├── js/
│   │   ├── main.js
│   │   ├── map.js
|   |   |-- utils/
|   |   |   |-- helpers.js
│   │   └── modules/
│   │       ├── auth.js
│   │       ├── search.js
│   │       ├── navigation.js
│   │       └── animations.js
│   ├── index.html
│   ├── map.html
│   └── admin.html
│
├── server.js
├── package.json
└── README.md

---

## 💻 Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)

### Steps

```bash
# 1. Clone repository
git clone https://github.com/smurfstack-dev/ParkEase.git
cd ParkEase

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run dev

# 3. Setup frontend (new terminal)
cd ..
node server.js