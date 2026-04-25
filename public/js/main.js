// ES6+ Main Application
import { navigation } from "./modules/navigation.js";
import { animations } from "./modules/animations.js";
import { searchHandler } from "./modules/search.js";
import { auth } from "./modules/auth.js";
import { showToast, storage } from "./utils/helpers.js";

class ParkEaseApp {
  constructor() {
    this.init();
  }

  async init() {
    console.log("🚀 ParkEase App Initialized");

    this.loadModules();
    this.setupEventListeners();
    this.setupStatsAnimation();
    this.addAnimationStyles();
  }

  loadModules() {
    console.log("✅ Modules loaded");
  }

  setupEventListeners() {
    const getStartedBtn = document.getElementById("getStartedBtn");
    if (getStartedBtn) {
      getStartedBtn.addEventListener("click", () => {
        if (auth.isLoggedIn) {
          window.location.href = "/map.html";
        } else {
          auth.showSignupModal();
        }
      });
    }

    const findParkingBtn = document.getElementById("findParkingBtn");
    if (findParkingBtn) {
      findParkingBtn.addEventListener("click", () => {
        if (auth.isLoggedIn) {
          localStorage.removeItem("searchCoordinates");
          localStorage.removeItem("searchLocation");
          window.location.href = "/map.html";
        } else {
          showToast("Please login to find parking", "error");
          auth.showLoginModal();
        }
      });
    }

    const demoBtn = document.getElementById("demoBtn");
    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        showToast("Demo video coming soon!", "success");
      });
    }
  }

  setupStatsAnimation() {
    const stats = document.querySelectorAll(".stat-number");

    const observerOptions = {
      threshold: 0.5,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statElement = entry.target;
          const targetText = statElement.textContent;
          const targetNumber = parseInt(targetText);

          if (!isNaN(targetNumber)) {
            this.animateCounter(statElement, targetNumber);
          } else if (targetText.includes("k")) {
            const num = parseInt(targetText) * 1000;
            this.animateCounter(statElement, num, true);
          } else if (targetText.includes("%")) {
            const num = parseInt(targetText);
            this.animateCounter(statElement, num, false, "%");
          } else if (targetText.includes("+")) {
            const num = parseInt(targetText);
            this.animateCounter(statElement, num, false, "+");
          }

          observer.unobserve(statElement);
        }
      });
    }, observerOptions);

    stats.forEach((stat) => observer.observe(stat));
  }

  animateCounter(element, target, isK = false, suffix = "") {
    let current = 0;
    const increment = target / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        if (isK) {
          element.textContent = target / 1000 + "k" + suffix;
        } else {
          element.textContent = target + suffix;
        }
        clearInterval(timer);
      } else {
        if (isK) {
          element.textContent = Math.floor(current / 1000) + "k" + suffix;
        } else {
          element.textContent = Math.floor(current) + suffix;
        }
      }
    }, 40);
  }

  addAnimationStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            .navbar.scrolled {
                background: rgba(15, 15, 26, 0.98);
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
        `;
    document.head.appendChild(style);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new ParkEaseApp();
});
