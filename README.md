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
```text
ParkEase/
│
├── backend/                            # Backend Node.js server
│ ├── config/
│ │ └── db.js                           # Database connection
│ ├── controllers/
│ │ ├── authController.js               # Authentication logic
│ │ ├── bookingController.js            # Booking operations
│ │ └── parkingController.js            # Parking spots operations
│ ├── middleware/
│ │ └── auth.js                         # JWT verification
│ ├── routes/
│ │ ├── auth.js                         # Authentication routes
│ │ ├── booking.js                      # Booking routes
│ │ ├── parking.js                      # Parking routes
│ │ ├── admin.js                        # Admin routes
│ │ └── payment.js                      # Payment routes (Razorpay)
│ ├── .env                              # Environment variables
│ └── server.js                         # Backend entry point
│
├── public/                             # Frontend files
│ ├── css/
│ │ ├── style.css                       # Landing page styles
│ │ └── map.css                         # Map page styles
│ ├── js/
│ │ ├── main.js                         # Landing page logic
│ │ ├── map.js                          # Map page logic
| | |-- utils/
| | |   |-- helpers.js  
│ │ └── modules/
│ │ ├── auth.js                         # Authentication module
│ │ ├── search.js                       # Search module
│ │ ├── navigation.js                   # Navigation module
│ │ └── animations.js                   # Animation module
│ ├── index.html                        # Landing page
│ ├── map.html                          # Map & booking page
│ └── admin.html                        # Admin panel
│
├── server.js                           # Frontend server
├── package.json                        # Dependencies
└── README.md                           # Project documentation
```
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