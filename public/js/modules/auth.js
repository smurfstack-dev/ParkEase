// ES6+ Authentication Module
import { validateEmail, showToast, storage } from "../utils/helpers.js";

class Auth {
  constructor() {
    this.isLoggedIn = storage.get("isLoggedIn") || false;
    this.currentUser = storage.get("currentUser") || null;
    this.users = storage.get("users") || [];
    this.init();
  }

  init() {
    this.setupAuthButtons();
    this.updateUI();
  }

  setupAuthButtons() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (loginBtn) {
      const newLoginBtn = loginBtn.cloneNode(true);
      loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
      newLoginBtn.addEventListener("click", () => this.showLoginModal());
    }

    if (signupBtn) {
      const newSignupBtn = signupBtn.cloneNode(true);
      signupBtn.parentNode.replaceChild(newSignupBtn, signupBtn);
      newSignupBtn.addEventListener("click", () => {
        if (this.isLoggedIn) {
          this.showUserMenu();
        } else {
          this.showSignupModal();
        }
      });
    }
  }

  showLoginModal() {
    this.removeExistingModal();

    const modal = this.createModal("Welcome Back!", "login");
    document.body.appendChild(modal);

    const form = modal.querySelector("#authForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector('[type="email"]').value;
      const password = form.querySelector('[type="password"]').value;
      this.login(email, password);
    });

    const switchLink = modal.querySelector(".switch-mode");
    if (switchLink) {
      switchLink.addEventListener("click", (e) => {
        e.preventDefault();
        modal.remove();
        this.showSignupModal();
      });
    }
  }

  showSignupModal() {
    this.removeExistingModal();

    const modal = this.createModal("Create Account", "signup");
    document.body.appendChild(modal);

    const form = modal.querySelector("#authForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#name")?.value;
      const email = form.querySelector('[type="email"]').value;
      const password = form.querySelector("#password").value;
      const confirmPassword = form.querySelector("#confirmPassword")?.value;
      this.signup(name, email, password, confirmPassword);
    });

    const switchLink = modal.querySelector(".switch-mode");
    if (switchLink) {
      switchLink.addEventListener("click", (e) => {
        e.preventDefault();
        modal.remove();
        this.showLoginModal();
      });
    }
  }

  removeExistingModal() {
    const existingModal = document.querySelector(".auth-modal");
    if (existingModal) existingModal.remove();
  }

  createModal(title, type) {
    const modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

    modal.innerHTML = `
            <div class="modal-content" style="
                background: linear-gradient(135deg, #1a1a2e, #0f0f1a);
                padding: 2rem;
                border-radius: 24px;
                width: 90%;
                max-width: 420px;
                animation: slideIn 0.3s ease;
                border: 1px solid rgba(255,255,255,0.1);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="color: white; font-size: 1.8rem;">${title}</h2>
                    <button class="close-modal" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #94a3b8; transition: all 0.3s;">&times;</button>
                </div>
                
                <form id="authForm">
                    ${
                      type === "signup"
                        ? `
                        <div style="margin-bottom: 1rem;">
                            <input type="text" id="name" placeholder="Full Name" required style="
                                width: 100%; 
                                padding: 14px; 
                                background: rgba(255,255,255,0.05); 
                                border: 1px solid rgba(255,255,255,0.1); 
                                border-radius: 12px; 
                                font-size: 1rem;
                                color: white;
                                outline: none;
                                transition: all 0.3s;
                            ">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <input type="email" placeholder="Email address" required style="
                                width: 100%; 
                                padding: 14px; 
                                background: rgba(255,255,255,0.05); 
                                border: 1px solid rgba(255,255,255,0.1); 
                                border-radius: 12px; 
                                font-size: 1rem;
                                color: white;
                                outline: none;
                                transition: all 0.3s;
                            ">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <input type="password" id="password" placeholder="Password (min 6 characters)" required style="
                                width: 100%; 
                                padding: 14px; 
                                background: rgba(255,255,255,0.05); 
                                border: 1px solid rgba(255,255,255,0.1); 
                                border-radius: 12px; 
                                font-size: 1rem;
                                color: white;
                                outline: none;
                                transition: all 0.3s;
                            ">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <input type="password" id="confirmPassword" placeholder="Confirm Password" required style="
                                width: 100%; 
                                padding: 14px; 
                                background: rgba(255,255,255,0.05); 
                                border: 1px solid rgba(255,255,255,0.1); 
                                border-radius: 12px; 
                                font-size: 1rem;
                                color: white;
                                outline: none;
                                transition: all 0.3s;
                            ">
                        </div>
                    `
                        : `
                        <div style="margin-bottom: 1rem;">
                            <input type="email" placeholder="Email address" required style="
                                width: 100%; 
                                padding: 14px; 
                                background: rgba(255,255,255,0.05); 
                                border: 1px solid rgba(255,255,255,0.1); 
                                border-radius: 12px; 
                                font-size: 1rem;
                                color: white;
                                outline: none;
                                transition: all 0.3s;
                            ">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <input type="password" id="password" placeholder="Password" required style="
                                width: 100%; 
                                padding: 14px; 
                                background: rgba(255,255,255,0.05); 
                                border: 1px solid rgba(255,255,255,0.1); 
                                border-radius: 12px; 
                                font-size: 1rem;
                                color: white;
                                outline: none;
                                transition: all 0.3s;
                            ">
                        </div>
                    `
                    }
                    
                    <div id="errorMessage" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
                    
                    <button type="submit" style="
                        width: 100%; 
                        padding: 14px; 
                        background: linear-gradient(135deg, #3b82f6, #06b6d4); 
                        color: white; 
                        border: none; 
                        border-radius: 12px; 
                        cursor: pointer; 
                        font-size: 1rem; 
                        font-weight: 600;
                        transition: all 0.3s;
                    ">
                        ${type === "login" ? "Login" : "Create Account"}
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                    ${
                      type === "login"
                        ? `
                        <p style="color: #94a3b8;">
                            Don't have an account? 
                            <a href="#" class="switch-mode" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Sign Up</a>
                        </p>
                    `
                        : `
                        <p style="color: #94a3b8;">
                            Already have an account? 
                            <a href="#" class="switch-mode" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Login</a>
                        </p>
                    `
                    }
                </div>
            </div>
        `;

    const inputs = modal.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        input.style.borderColor = "#3b82f6";
        input.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
      });
      input.addEventListener("blur", () => {
        input.style.borderColor = "rgba(255,255,255,0.1)";
        input.style.boxShadow = "none";
      });
    });

    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => modal.remove());
    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.color = "white";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.color = "#94a3b8";
    });

    const submitBtn = modal.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener("mouseenter", () => {
        submitBtn.style.transform = "translateY(-2px)";
        submitBtn.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.3)";
      });
      submitBtn.addEventListener("mouseleave", () => {
        submitBtn.style.transform = "translateY(0)";
        submitBtn.style.boxShadow = "none";
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    return modal;
  }

  showError(message) {
    const errorDiv = document.querySelector("#errorMessage");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 3000);
    }
    showToast(message, "error");
  }

  async signup(name, email, password, confirmPassword) {
    const errorDiv = document.querySelector("#errorMessage");
    if (errorDiv) errorDiv.style.display = "none";

    if (!name || name.length < 2) {
      this.showError("Please enter your full name");
      return;
    }

    if (!validateEmail(email)) {
      this.showError("Please enter a valid email");
      return;
    }

    if (!password || password.length < 6) {
      this.showError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      this.showError("Passwords do not match");
      return;
    }

    showToast("Creating account...", "info");

    try {
      const response = await fetch(
        "https://parkease-backend-u530.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        this.isLoggedIn = true;
        this.currentUser = data.user;
        storage.set("isLoggedIn", true);
        storage.set("currentUser", this.currentUser);
        this.updateUI();
        this.setupAuthButtons();
        showToast(`Welcome to ParkEase, ${name}!`, "success");
        document.querySelector(".auth-modal")?.remove();
      } else {
        this.showError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      this.showError("Server error. Please try again.");
    }
  }

  async login(email, password) {
    const errorDiv = document.querySelector("#errorMessage");
    if (errorDiv) errorDiv.style.display = "none";

    if (!validateEmail(email)) {
      this.showError("Please enter a valid email");
      return;
    }

    if (!password || password.length < 6) {
      this.showError("Password must be at least 6 characters");
      return;
    }

    showToast("Logging in...", "info");

    try {
      const response = await fetch(
        "https://parkease-backend-u530.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        this.isLoggedIn = true;
        this.currentUser = data.user;
        storage.set("isLoggedIn", true);
        storage.set("currentUser", this.currentUser);
        this.updateUI();
        this.setupAuthButtons();
        showToast(`Welcome back, ${data.user.name}!`, "success");
        document.querySelector(".auth-modal")?.remove();
      } else {
        this.showError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showError("Server error. Please try again.");
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem("token");
    storage.remove("isLoggedIn");
    storage.remove("currentUser");
    this.updateUI();
    this.setupAuthButtons();
    showToast("Logged out successfully", "success");

    const userMenu = document.querySelector(".user-menu");
    if (userMenu) userMenu.remove();
  }

  updateUI() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    if (this.isLoggedIn && this.currentUser) {
      if (loginBtn) {
        loginBtn.style.display = "none";
      }
      if (signupBtn) {
        signupBtn.textContent = `👤 ${this.currentUser.name}`;
        signupBtn.classList.remove("btn-primary");
        signupBtn.classList.add("btn-outline");
      }
    } else {
      if (loginBtn) {
        loginBtn.style.display = "block";
      }
      if (signupBtn) {
        signupBtn.textContent = "Sign Up";
        signupBtn.classList.remove("btn-outline");
        signupBtn.classList.add("btn-primary");
      }
    }
  }

  showUserMenu() {
    const existingMenu = document.querySelector(".user-menu");
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement("div");
    menu.className = "user-menu";
    menu.style.cssText = `
            position: absolute;
            top: 70px;
            right: 20px;
            background: linear-gradient(135deg, #1a1a2e, #0f0f1a);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            padding: 1rem;
            z-index: 1000;
            min-width: 260px;
            animation: slideIn 0.2s ease;
            border: 1px solid rgba(255,255,255,0.1);
        `;

    menu.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; font-weight: 600;">
                    ${this.currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p style="font-weight: 600; color: white; margin-bottom: 2px;">${this.currentUser.name}</p>
                    <p style="font-size: 0.7rem; color: #64748b;">${this.currentUser.email}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 8px;">
                <button id="myBookingsBtn" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: none; text-align: left; cursor: pointer; border-radius: 8px; margin-bottom: 6px; color: #cbd5e1; transition: all 0.3s; display: flex; align-items: center; gap: 10px;">
                    <span>📅</span>
                    <span>My Bookings</span>
                </button>
                <button id="myProfileBtn" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: none; text-align: left; cursor: pointer; border-radius: 8px; color: #cbd5e1; transition: all 0.3s; display: flex; align-items: center; gap: 10px;">
                    <span>👤</span>
                    <span>My Profile</span>
                </button>
            </div>
            
            <hr style="margin: 8px 0; border-color: rgba(255,255,255,0.1);">
            
            <button id="logoutBtn" style="width: 100%; padding: 10px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; margin-top: 8px; transition: all 0.3s;">
                Logout
            </button>
        `;

    document.body.appendChild(menu);

    const myBookingsBtn = document.getElementById("myBookingsBtn");
    if (myBookingsBtn) {
      myBookingsBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.remove();

        const token = localStorage.getItem("token");
        if (!token) {
          showToast("Please login again", "error");
          return;
        }

        showToast("Loading your bookings...", "info");

        try {
          const response = await fetch(
            "https://parkease-backend-u530.onrender.com/api/bookings/my-bookings",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await response.json();

          if (response.ok && data.success) {
            this.showBookingsModal(data.bookings);
          } else {
            showToast("No bookings found", "info");
          }
        } catch (error) {
          showToast("Server error", "error");
        }
      });
    }

    const myProfileBtn = document.getElementById("myProfileBtn");
    if (myProfileBtn) {
      myProfileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.remove();
        this.showMyProfile();
      });
    }

    const btns = ["myBookingsBtn", "myProfileBtn"];
    btns.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("mouseenter", () => {
          btn.style.background = "rgba(59, 130, 246, 0.2)";
          btn.style.color = "white";
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.background = "rgba(255,255,255,0.05)";
          btn.style.color = "#cbd5e1";
        });
      }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("mouseenter", () => {
        logoutBtn.style.background = "#dc2626";
      });
      logoutBtn.addEventListener("mouseleave", () => {
        logoutBtn.style.background = "#ef4444";
      });
      logoutBtn.addEventListener("click", () => {
        this.logout();
        menu.remove();
      });
    }

    setTimeout(() => {
      document.addEventListener("click", function closeMenu(e) {
        if (!menu.contains(e.target) && !e.target.closest("#signupBtn")) {
          menu.remove();
          document.removeEventListener("click", closeMenu);
        }
      });
    }, 100);
  }

  // Main function - My Bookings Modal with Cancel Button
  showBookingsModal(bookings) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "block";
    modal.style.zIndex = "10000";

    let html = `
            <div class="modal-content" style="max-width: 650px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>📅 My Bookings <span style="font-size: 0.8rem; color: #10b981;">(${bookings.length})</span></h2>
                    <span class="close" style="cursor: pointer; font-size: 1.8rem;">&times;</span>
                </div>
                <div class="modal-body">
        `;

    if (bookings.length === 0) {
      html += `<div style="text-align: center; padding: 2rem; color: #94a3b8;">No bookings yet.</div>`;
    } else {
      for (let booking of bookings) {
        const isCancelled = booking.status === "cancelled";
        html += `
                    <div class="booking-item" data-id="${booking.id}" data-spot-id="${booking.spot_id}" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; border-left: 3px solid ${isCancelled ? "#ef4444" : "#10b981"}; opacity: ${isCancelled ? "0.6" : "1"};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <strong style="color: white; font-size: 1rem;">${booking.spot_name}</strong>
                            <span style="color: ${isCancelled ? "#ef4444" : "#10b981"}; font-weight: bold;">₹${booking.total_amount}</span>
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem;">
                            📍 ${booking.address || "Parking Location"}
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem;">
                            🚗 Vehicle: ${booking.vehicle_number}
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.3rem;">
                            ⏱️ Duration: ${booking.duration} hours
                        </div>
                        <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem;">
                            📅 Booked on: ${new Date(booking.created_at).toLocaleString()}
                        </div>
                        <div style="margin-top: 0.5rem; display: flex; gap: 10px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                            <div style="display: flex; gap: 10px;">
                                <span style="background: ${isCancelled ? "#ef4444" : "#10b981"}; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; color: white;">
                                    ${isCancelled ? "❌ Cancelled" : "✅ Confirmed"}
                                </span>
                                <span style="background: #3b82f6; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; color: white;">⏱️ ${booking.duration} hrs</span>
                            </div>
                `;

        if (!isCancelled) {
          html += `
                            <button class="cancel-booking-btn" data-id="${booking.id}" data-spot-id="${booking.spot_id}" style="background: #ef4444; color: white; border: none; padding: 5px 15px; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">
                                Cancel Booking
                            </button>
                    `;
        }

        html += `
                        </div>
                    </div>
                `;
      }
    }

    html += `
                </div>
            </div>
        `;

    modal.innerHTML = html;
    document.body.appendChild(modal);

    // Close button
    const closeBtn = modal.querySelector(".close");
    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    // Cancel button event listeners with custom confirmation modal
    const cancelBtns = modal.querySelectorAll(".cancel-booking-btn");
    cancelBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const bookingId = btn.dataset.id;
        const spotId = btn.dataset.spotId;
        this.showCancelConfirmation(bookingId, spotId, modal);
      };
    });
  }

  // Custom Cancel Confirmation Modal (Professional)
  showCancelConfirmation(bookingId, spotId, currentModal) {
    const confirmModal = document.createElement("div");
    confirmModal.className = "modal";
    confirmModal.style.display = "block";
    confirmModal.style.zIndex = "10001";

    confirmModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-header">
                    <h2>Cancel Booking</h2>
                    <span class="close" style="cursor: pointer; font-size: 1.8rem;">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❓</div>
                    <p style="color: white; margin-bottom: 1rem; font-size: 1.1rem;">Are you sure you want to cancel this booking?</p>
                    <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem;">This action cannot be undone.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="confirmCancelBtn" style="background: #ef4444; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            Yes, Cancel
                        </button>
                        <button id="dismissCancelBtn" style="background: #3b82f6; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            No, Go Back
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(confirmModal);

    // Hover effects
    const confirmBtn = confirmModal.querySelector("#confirmCancelBtn");
    const dismissBtn = confirmModal.querySelector("#dismissCancelBtn");

    confirmBtn.onmouseenter = () => (confirmBtn.style.background = "#dc2626");
    confirmBtn.onmouseleave = () => (confirmBtn.style.background = "#ef4444");
    dismissBtn.onmouseenter = () => (dismissBtn.style.background = "#2563eb");
    dismissBtn.onmouseleave = () => (dismissBtn.style.background = "#3b82f6");

    // Close buttons
    const closeBtn = confirmModal.querySelector(".close");
    closeBtn.onclick = () => confirmModal.remove();
    confirmModal.onclick = (e) => {
      if (e.target === confirmModal) confirmModal.remove();
    };

    // Dismiss button
    dismissBtn.onclick = () => confirmModal.remove();

    // Confirm cancel button
    confirmBtn.onclick = async () => {
      confirmModal.remove();

      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `https://parkease-backend-u530.onrender.com/api/bookings/cancel/${bookingId}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          showToast("✅ Booking cancelled successfully!", "success");
          currentModal.remove();

          // Update the parking spot in map to remove "booked" status and increase available spots
          if (window.parkingMap && window.parkingMap.parkingSpots) {
            const spotIndex = window.parkingMap.parkingSpots.findIndex(
              (s) => s.id == spotId,
            );
            if (spotIndex !== -1) {
              window.parkingMap.parkingSpots[spotIndex].isBookedByUser = false;
              window.parkingMap.parkingSpots[spotIndex].available++;
              window.parkingMap.renderParkingList();
              window.parkingMap.addMarkersToMap();
              window.parkingMap.updateSpotsCount();
            }
          }

          // Refresh bookings modal
          setTimeout(() => {
            document.getElementById("myBookingsBtn").click();
          }, 500);
        } else {
          showToast("Failed to cancel booking", "error");
        }
      } catch (error) {
        showToast("Error cancelling booking", "error");
      }
    };
  }

  showMyProfile() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "block";
    modal.style.zIndex = "10000";

    modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h2>👤 My Profile</h2>
                    <span class="close" style="cursor: pointer; font-size: 1.8rem;">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2rem; color: white;">
                            ${this.currentUser.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" value="${this.currentUser.name}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" value="${this.currentUser.email}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Member Since</label>
                        <input type="text" value="${new Date().toLocaleDateString()}" readonly>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".close");
    closeBtn.onclick = () => modal.remove();

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }
}

export const auth = new Auth();
