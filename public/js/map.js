// Map Module
import { storage, showToast, getCurrentLocation } from "./utils/helpers.js";
import { auth } from "./modules/auth.js";

class ParkingMap {
  constructor() {
    this.map = null;
    this.markers = [];
    this.parkingSpots = [];
    this.originalParkingSpots = [];
    this.userLocation = null;
    this.selectedSpot = null;
    this.locationCache = new Map();
    this.currentLocationKey = null;
    this.updateInterval = null;
    this.currentFilters = {
      distance: 0,
      priceRange: "all",
      minRating: 0,
    };
    this.init();
  }

  async init() {
    if (!auth.isLoggedIn) {
      window.location.href = "/";
      return;
    }

    this.setupUI();
    await this.initMap();
    await this.loadParkingSpots();
    this.setupEventListeners();
    this.startRealTimeUpdates();
  }

  setupUI() {
    const userGreeting = document.getElementById("userGreeting");
    if (userGreeting && auth.currentUser) {
      userGreeting.textContent = `👋 Hi, ${auth.currentUser.name}`;
    }

    const logoutBtn = document.getElementById("logoutBtnNav");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        auth.logout();
        window.location.href = "/";
      });
    }

    const logo = document.querySelector(".nav-brand");
    if (logo) {
      logo.addEventListener("click", () => {
        window.location.href = "/";
      });
    }

    const bookingsLink = document.getElementById("bookingsLink");
    if (bookingsLink) {
      bookingsLink.addEventListener("click", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
          showToast("Please login first", "error");
          return;
        }

        showToast("Loading your bookings...", "info");

        try {
          const response = await fetch(
            "http://localhost:5000/api/bookings/my-bookings",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await response.json();

          if (response.ok && data.success) {
            auth.showBookingsModal(data.bookings);
          } else {
            showToast("No bookings found", "info");
          }
        } catch (error) {
          showToast("Server error", "error");
        }
      });
    }
  }

  async initMap() {
    const savedCoordinates = localStorage.getItem("searchCoordinates");
    const savedLocation = localStorage.getItem("searchLocation");

    let centerLat = 31.326;
    let centerLng = 75.5762;
    let locationKey = null;

    if (savedCoordinates) {
      try {
        const coords = JSON.parse(savedCoordinates);
        centerLat = coords.lat;
        centerLng = coords.lng;
        locationKey = `${centerLat.toFixed(4)},${centerLng.toFixed(4)}`;

        if (savedLocation) {
          setTimeout(() => {
            showToast(`Showing parking near: ${savedLocation}`, "success");
          }, 500);
        }

        localStorage.removeItem("searchCoordinates");
      } catch (e) {
        console.error("Error parsing saved coordinates");
      }
    } else {
      try {
        const position = await getCurrentLocation();
        centerLat = position.coords.latitude;
        centerLng = position.coords.longitude;
        this.userLocation = [centerLat, centerLng];
        locationKey = `${centerLat.toFixed(4)},${centerLng.toFixed(4)}`;
      } catch (error) {
        console.log("Using default location (Jalandhar)");
        locationKey = "31.3260,75.5762";
      }
    }

    this.map = L.map("map", {
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: false,
    }).setView([centerLat, centerLng], 13);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
        subdomains: "abcd",
        maxZoom: 18,
        minZoom: 10,
        updateWhenIdle: true,
        updateWhenZooming: false,
      },
    ).addTo(this.map);

    if (this.userLocation || savedCoordinates) {
      L.marker([centerLat, centerLng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: '<div style="background: #3b82f6; color: white; border-radius: 50%; padding: 5px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 14px;">📍</div>',
          iconSize: [36, 36],
        }),
      })
        .addTo(this.map)
        .bindPopup(savedLocation || "Your Location");
    }

    setTimeout(() => {
      localStorage.removeItem("searchLocation");
    }, 1000);
  }

  async loadParkingSpots() {
    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login again", "error");
      window.location.href = "/";
      return;
    }

    const center = this.map.getCenter();

    let currentCity = "";
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${center.lat}&lon=${center.lng}&format=json`,
        { headers: { "User-Agent": "ParkEase-App/1.0" } },
      );
      const geoData = await geoResponse.json();
      currentCity = geoData.address?.city || geoData.address?.town || "";
    } catch (error) {
      console.log("Could not detect city");
    }

    const container = document.getElementById("parkingList");
    if (container) {
      container.innerHTML =
        '<div class="loading-spinner">Finding real-time parking spots...</div>';
    }

    try {
      const url = currentCity
        ? `http://localhost:5000/api/parking/spots?city=${encodeURIComponent(currentCity)}`
        : "http://localhost:5000/api/parking/spots";

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.comingSoon) {
          showToast(data.message, "info");
          this.originalParkingSpots = [];
          this.parkingSpots = [];
          this.renderEmptyMessage(data.message);
          return;
        }

        if (data.noSpots) {
          showToast(data.message, "info");
          this.originalParkingSpots = [];
          this.parkingSpots = [];
          this.renderEmptyMessage(data.message);
          return;
        }

        if (data.spots && data.spots.length > 0) {
          // Fetch user's booked spots to mark them
          let userBookedSpotIds = [];
          try {
            const bookingsResponse = await fetch(
              "http://localhost:5000/api/bookings/my-bookings",
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const bookingsData = await bookingsResponse.json();
            if (bookingsData.success) {
              userBookedSpotIds = bookingsData.bookings
                .filter((b) => b.status === "confirmed")
                .map((b) => b.spot_id);
            }
          } catch (error) {
            console.log("Could not fetch user bookings");
          }

          this.originalParkingSpots = data.spots.map((spot) => ({
            id: spot.id,
            name: spot.name,
            address: spot.address,
            lat: parseFloat(spot.latitude),
            lng: parseFloat(spot.longitude),
            price: spot.price_per_hour,
            rating: spot.rating,
            available: spot.available_spots,
            total: spot.total_spots,
            city: spot.city,
            isBookedByUser: userBookedSpotIds.includes(spot.id),
            distance:
              this.calculateDistance(
                center.lat,
                center.lng,
                parseFloat(spot.latitude),
                parseFloat(spot.longitude),
              ) / 1000,
            features: ["CCTV", "Security", "Verified"],
            isOpen24x7: true,
          }));

          this.parkingSpots = [...this.originalParkingSpots];
          this.updateSpotsCount();
          this.addMarkersToMap();
          this.renderParkingList();
          showToast(
            `🟢 ${data.spots.length} parking spots available`,
            "success",
          );
        }
      } else {
        showToast("Failed to load parking spots", "error");
      }
    } catch (error) {
      console.error("Error loading parking spots:", error);
      showToast("Server error. Please try again.", "error");
    }
  }

  renderParkingList() {
    const container = document.getElementById("parkingList");

    if (this.parkingSpots.length === 0) {
      container.innerHTML =
        '<div class="loading-spinner">No parking spots found</div>';
      return;
    }

    container.innerHTML = this.parkingSpots
      .map((spot) => {
        const occupancyRate = (spot.available / spot.total) * 100;
        let statusClass = "";
        let statusText = "";
        let statusColor = "";
        let buttonText = "📅 Book This Spot →";
        let buttonDisabled = false;

        if (spot.isBookedByUser) {
          statusClass = "booked-by-user";
          statusText = "📌 YOU HAVE BOOKED THIS SPOT";
          statusColor = "#8b5cf6";
          buttonText = "📌 Already Booked";
          buttonDisabled = true;
        } else if (spot.available === 0) {
          statusClass = "fully-booked";
          statusText = "🔴 FULLY BOOKED";
          statusColor = "#ef4444";
          buttonText = "🔴 Fully Booked";
          buttonDisabled = true;
        } else if (spot.available <= 3) {
          statusClass = "limited";
          statusText = `⚠️ Only ${spot.available} spots left!`;
          statusColor = "#f59e0b";
        } else {
          statusClass = "available";
          statusText = `✅ ${spot.available} spots available`;
          statusColor = "#10b981";
        }

        return `
                <div class="parking-card ${statusClass}" data-id="${spot.id}" data-available="${spot.available}">
                    <div class="parking-card-header">
                        <h3>${spot.name} <span class="real-time-badge"></span></h3>
                        <div class="rating">⭐ ${spot.rating}</div>
                    </div>
                    <div class="parking-address">📍 ${spot.address}</div>
                    <div class="parking-details">
                        <span>📏 ${parseFloat(spot.distance).toFixed(1)} km away</span>
                        <span>🚗 ${spot.available}/${spot.total} spots</span>
                        <span>${spot.isOpen24x7 ? "🕐 24x7" : "🕘 6AM-10PM"}</span>
                    </div>
                    <div class="price">₹${spot.price}/hour</div>
                    <div class="availability-progress">
                        <div class="progress-bar" style="width: ${occupancyRate}%; background: ${spot.isBookedByUser ? "#8b5cf6" : occupancyRate > 80 ? "#ef4444" : occupancyRate > 50 ? "#f59e0b" : "#10b981"};"></div>
                    </div>
                    <div class="availability ${statusClass}" style="color: ${statusColor};">
                        ${statusText}
                    </div>
                    <div class="features">
                        ${spot.features.map((f) => `<span class="feature-tag">${f}</span>`).join("")}
                    </div>
                    <button class="book-btn" data-id="${spot.id}" ${buttonDisabled ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ""}>
                        ${buttonText}
                    </button>
                </div>
            `;
      })
      .join("");

    document.querySelectorAll(".parking-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("book-btn")) {
          const id = parseInt(card.dataset.id);
          this.selectParkingSpot(id);
        }
      });

      const bookBtn = card.querySelector(".book-btn");
      if (bookBtn && !bookBtn.disabled) {
        bookBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(bookBtn.dataset.id);
          this.bookSpot(id);
        });
      }
    });
  }

  startRealTimeUpdates() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
      this.refreshAvailability();
    }, 30000);
  }

  async refreshAvailability() {
    const token = localStorage.getItem("token");
    if (!token) return;

    for (let spot of this.parkingSpots) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/parking/availability/${spot.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();

        if (data.success && data.availability.available !== spot.available) {
          spot.available = data.availability.available;
          const originalSpot = this.originalParkingSpots.find(
            (s) => s.id === spot.id,
          );
          if (originalSpot)
            originalSpot.available = data.availability.available;
        }
      } catch (error) {
        console.error("Refresh error:", error);
      }
    }

    this.renderParkingList();
    this.addMarkersToMap();
    this.updateSpotsCount();
  }

  addMarkersToMap() {
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];

    this.parkingSpots.forEach((spot) => {
      let markerColor = "#10b981";
      let markerIcon = "🅿️";

      if (spot.isBookedByUser) {
        markerColor = "#8b5cf6";
        markerIcon = "📌";
      } else if (spot.available === 0) {
        markerColor = "#ef4444";
        markerIcon = "🔴";
      } else if (spot.available <= 3) {
        markerColor = "#f59e0b";
        markerIcon = "🟠";
      }

      const marker = L.marker([spot.lat, spot.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="background: ${markerColor}; color: white; border-radius: 50%; padding: 5px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${markerIcon}</div>`,
          iconSize: [36, 36],
        }),
      }).addTo(this.map);

      const popupContent = `
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 5px 0;">${spot.name}</h4>
                    <p style="margin: 0 0 5px 0; color: #666;">${spot.address}</p>
                    <p style="margin: 0 0 5px 0;">
                        <strong>₹${spot.price}</strong>/hour | 
                        <span style="color: ${spot.available > 5 ? "#10b981" : "#f59e0b"}">
                            ${spot.available} spots available
                        </span>
                    </p>
                    <button onclick="window.parkingMap.bookSpot(${spot.id})" 
                            style="background: #3b82f6; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">
                        Book Now
                    </button>
                </div>
            `;

      marker.bindPopup(popupContent);
      this.markers.push(marker);
    });
  }

  selectParkingSpot(id) {
    this.selectedSpot = this.parkingSpots.find((s) => s.id === id);

    document.querySelectorAll(".parking-card").forEach((card) => {
      card.classList.remove("selected");
      if (parseInt(card.dataset.id) === id) {
        card.classList.add("selected");
      }
    });

    if (this.selectedSpot) {
      this.map.setView([this.selectedSpot.lat, this.selectedSpot.lng], 16);

      const marker = this.markers.find(
        (m) =>
          m.getLatLng().lat === this.selectedSpot.lat &&
          m.getLatLng().lng === this.selectedSpot.lng,
      );
      if (marker) marker.openPopup();
    }
  }

  bookSpot(id) {
    const spot = this.parkingSpots.find((s) => s.id === id);
    if (!spot) return;

    if (spot.available === 0) {
      showToast("Sorry, this parking spot is fully booked!", "error");
      return;
    }

    if (spot.isBookedByUser) {
      showToast("You have already booked this spot!", "error");
      return;
    }

    this.selectedSpot = spot;
    this.showBookingModal();
  }

  showBookingModal() {
    const modal = document.getElementById("bookingModal");
    const modalBody = document.getElementById("bookingModalBody");

    const now = new Date();
    const minDateTime = now.toISOString().slice(0, 16);

    modalBody.innerHTML = `
            <div class="form-group">
                <label>Parking Location</label>
                <input type="text" value="${this.selectedSpot.name} - ${this.selectedSpot.address}" readonly>
            </div>
            <div class="form-group">
                <label>Price per hour</label>
                <input type="text" value="₹${this.selectedSpot.price}/hour" readonly>
            </div>
            <div class="form-group">
                <label>Available Spots</label>
                <input type="text" value="${this.selectedSpot.available} spots left" readonly style="color: ${this.selectedSpot.available <= 3 ? "#f59e0b" : "#10b981"};">
            </div>
            <div class="form-group">
                <label>Start Time</label>
                <input type="datetime-local" id="startTime" min="${minDateTime}" required>
            </div>
            <div class="form-group">
                <label>Duration (hours)</label>
                <select id="duration">
                    <option value="1">1 hour - ₹${this.selectedSpot.price}</option>
                    <option value="2">2 hours - ₹${this.selectedSpot.price * 2}</option>
                    <option value="3">3 hours - ₹${this.selectedSpot.price * 3}</option>
                    <option value="4">4 hours - ₹${this.selectedSpot.price * 4}</option>
                </select>
            </div>
            <div class="form-group">
                <label>Vehicle Number</label>
                <input type="text" id="vehicleNo" placeholder="PB01AB1234" required>
            </div>
            <button class="payment-btn" id="proceedPaymentBtn">Confirm Booking →</button>
        `;

    modal.style.display = "block";

    const closeBtn = modal.querySelector(".close");
    closeBtn.onclick = () => (modal.style.display = "none");

    window.onclick = (event) => {
      if (event.target === modal) modal.style.display = "none";
    };

    const paymentBtn = document.getElementById("proceedPaymentBtn");
    paymentBtn.addEventListener("click", () => this.proceedToPayment());
  }

  async proceedToPayment() {
    const startTime = document.getElementById('startTime')?.value;
    const duration = document.getElementById('duration')?.value;
    const vehicleNo = document.getElementById('vehicleNo')?.value;
    if (!startTime || !vehicleNo) {
        showToast('Please fill all fields', 'error');
        return;
    }
    const totalAmount = this.selectedSpot.price * parseInt(duration);
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please login again', 'error');
        return;
    }

    try {
        const orderRes = await fetch('http://localhost:5000/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: totalAmount })
        });
        const orderData = await orderRes.json();
        if (!orderData.success) {
            showToast('Failed to create payment order', 'error');
            return;
        }

        const self = this; // preserve this for handler
        const options = {
            key: 'rzp_test_Sh0CA20EnHwOoQ',  
            amount: totalAmount * 100,
            currency: 'INR',
            name: 'ParkEase',
            description: `Booking for ${this.selectedSpot.name}`,
            order_id: orderData.order.id,
            handler: async (response) => {
                const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        bookingData: {
                            spot_id: self.selectedSpot.id,
                            start_time: startTime,
                            duration: parseInt(duration),
                            vehicle_number: vehicleNo,
                            total_amount: totalAmount
                        }
                    })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    showToast('✅ Payment successful! Booking confirmed.', 'success');
                    document.getElementById('bookingModal').style.display = 'none';
                    self.loadParkingSpots();
                } else {
                    showToast('Payment verification failed', 'error');
                }
            },
            prefill: { name: auth.currentUser?.name, email: auth.currentUser?.email },
            theme: { color: '#3b82f6' }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response) => {
            console.error('Payment failed:', response);
            showToast('Payment failed: ' + (response.error?.description || 'Unknown error'), 'error');
        });
        rzp.open();
    } catch (error) {
        console.error(error);
        showToast('Payment error', 'error');
    }
}

  updateSpotsCount() {
    const countEl = document.getElementById("spotsCount");
    if (countEl) {
      const totalAvailable = this.parkingSpots.reduce(
        (sum, spot) => sum + spot.available,
        0,
      );
      countEl.innerHTML = `${totalAvailable} spots available across ${this.parkingSpots.length} locations <span class="real-time-badge"></span>`;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  applyFiltersToSpots() {
    const distance = parseInt(
      document.getElementById("distanceFilter")?.value || 0,
    );
    const priceRange = document.getElementById("priceFilter")?.value || "all";
    const minRating = parseFloat(
      document.getElementById("ratingFilter")?.value || 0,
    );

    let filtered = [...this.originalParkingSpots];

    const center = this.map.getCenter();
    const centerLat = center.lat;
    const centerLng = center.lng;

    if (distance > 0) {
      filtered = filtered.filter((spot) => {
        const distanceInMeters = this.calculateDistance(
          centerLat,
          centerLng,
          spot.lat,
          spot.lng,
        );
        spot.calculatedDistance = (distanceInMeters / 1000).toFixed(1);
        return distanceInMeters <= distance;
      });
    } else {
      filtered = filtered.map((spot) => {
        const distanceInMeters = this.calculateDistance(
          centerLat,
          centerLng,
          spot.lat,
          spot.lng,
        );
        return {
          ...spot,
          distance: (distanceInMeters / 1000).toFixed(1),
        };
      });
    }

    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(
        (spot) => spot.price >= min && spot.price <= max,
      );
    }

    if (minRating > 0) {
      filtered = filtered.filter((spot) => spot.rating >= minRating);
    }

    filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    this.parkingSpots = filtered;
    this.updateSpotsCount();
    this.addMarkersToMap();
    this.renderParkingList();

    if (distance > 0 && filtered.length === 0) {
      showToast(
        `No spots within ${distance / 1000}km. Try increasing distance!`,
        "info",
      );
    } else if (distance === 0) {
      showToast(`Showing all ${filtered.length} parking spots`, "success");
    } else {
      showToast(
        `Found ${filtered.length} spots within ${distance / 1000}km`,
        "success",
      );
    }
  }

  applyFilters() {
    this.applyFiltersToSpots();
  }

  resetFilters() {
    const distanceFilter = document.getElementById("distanceFilter");
    const priceFilter = document.getElementById("priceFilter");
    const ratingFilter = document.getElementById("ratingFilter");

    if (distanceFilter) distanceFilter.value = "0";
    if (priceFilter) priceFilter.value = "all";
    if (ratingFilter) ratingFilter.value = "0";

    this.currentFilters = {
      distance: 0,
      priceRange: "all",
      minRating: 0,
    };

    this.parkingSpots = [...this.originalParkingSpots];

    const center = this.map.getCenter();
    this.parkingSpots = this.parkingSpots.map((spot) => {
      const distanceInMeters = this.calculateDistance(
        center.lat,
        center.lng,
        spot.lat,
        spot.lng,
      );
      return {
        ...spot,
        distance: (distanceInMeters / 1000).toFixed(1),
      };
    });

    this.parkingSpots.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
    );

    this.updateSpotsCount();
    this.addMarkersToMap();
    this.renderParkingList();

    showToast("All filters reset! Showing all parking spots", "success");
  }

  renderEmptyMessage(message) {
    const container = document.getElementById("parkingList");
    container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🅿️</div>
                <h3 style="color: white; margin-bottom: 0.5rem;">${message}</h3>
                <p style="color: #94a3b8;">Try searching in: Amritsar, Jalandhar, Ludhiana, Chandigarh, Patiala</p>
            </div>
        `;
  }

  async searchNewLocation(query) {
    if (!query || query.trim().length < 2) {
      showToast("Please enter a location (min 2 characters)", "error");
      return;
    }

    showToast(`Searching for ${query}...`, "info");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: { "User-Agent": "ParkEase-App/1.0" },
        },
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const locationName = data[0].display_name.split(",")[0];

        this.map.setView([lat, lng], 13);

        setTimeout(() => {
          this.loadParkingSpots();
        }, 500);

        showToast(
          `Now showing real-time parking near ${locationName}`,
          "success",
        );
        document.getElementById("mapSearchInput").value = "";
      } else {
        showToast(`Could not find location: ${query}`, "error");
      }
    } catch (error) {
      console.error("Search error:", error);
      showToast("Error searching location", "error");
    }
  }

  setupEventListeners() {
    const applyFiltersBtn = document.getElementById("applyFiltersBtn");
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener("click", () => this.applyFilters());
    }

    const resetFiltersBtn = document.getElementById("resetFiltersBtn");
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", () => this.resetFilters());
    }

    const myLocationBtn = document.getElementById("myLocationBtn");
    if (myLocationBtn) {
      myLocationBtn.addEventListener("click", async () => {
        try {
          const position = await getCurrentLocation();
          this.userLocation = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          this.map.setView(this.userLocation, 13);

          setTimeout(() => {
            this.loadParkingSpots();
          }, 500);

          showToast(`Showing real-time parking near your location`, "success");
        } catch (error) {
          showToast("Unable to get your location", "error");
        }
      });
    }

    const mapSearchBtn = document.getElementById("mapSearchBtn");
    const mapSearchInput = document.getElementById("mapSearchInput");

    if (mapSearchBtn) {
      mapSearchBtn.addEventListener("click", () => {
        const query = mapSearchInput?.value;
        if (query && query.trim().length >= 2) {
          this.searchNewLocation(query);
        } else {
          showToast("Please enter a valid location", "error");
        }
      });
    }

    if (mapSearchInput) {
      mapSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const query = mapSearchInput.value;
          if (query && query.trim().length >= 2) {
            this.searchNewLocation(query);
          } else {
            showToast("Please enter a valid location", "error");
          }
        }
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.parkingMap = new ParkingMap();
});
