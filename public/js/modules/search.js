// ES6+ Search Module
import { debounce, showToast, getCurrentLocation } from "../utils/helpers.js";
import { auth } from "./auth.js";

class SearchHandler {
  constructor() {
    this.searchInput = document.getElementById("locationSearch");
    this.searchBtn = document.getElementById("searchBtn");
    this.init();
  }

  init() {
    if (this.searchInput) {
      const debouncedSearch = debounce(
        (value) => this.handleSearch(value),
        500,
      );

      this.searchInput.addEventListener("input", (e) => {
        debouncedSearch(e.target.value);
      });

      this.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleSearch(this.searchInput.value);
        }
      });
    }

    this.searchBtn?.addEventListener("click", () => {
      this.handleSearch(this.searchInput?.value);
    });

    this.setupLocationButton();
  }

  async handleSearch(query) {
    if (!query || query.trim().length < 2) {
      showToast("Please enter a location (minimum 2 characters)", "error");
      return;
    }

    console.log(`🔍 Searching for: ${query}`);

    const recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]",
    );
    recentSearches.unshift(query);
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(recentSearches.slice(0, 5)),
    );

    localStorage.setItem("searchLocation", query);

    if (this.searchBtn) {
      this.searchBtn.textContent = "Searching...";
      this.searchBtn.disabled = true;
    }

    if (!auth.isLoggedIn) {
      showToast("Please login to see parking spots", "info");
      if (this.searchBtn) {
        this.searchBtn.textContent = "Search";
        this.searchBtn.disabled = false;
      }
      auth.showLoginModal();
      return;
    }

    const coordinates = await this.geocodeLocation(query);

    if (coordinates) {
      localStorage.setItem("searchCoordinates", JSON.stringify(coordinates));
      showToast(
        `Showing parking near ${coordinates.displayName || query}!`,
        "success",
      );

      setTimeout(() => {
        window.location.href = "/map";
      }, 500);
    } else {
      showToast(
        `Could not find location: ${query}. Please try a different location.`,
        "error",
      );
    }

    if (this.searchBtn) {
      this.searchBtn.textContent = "Search";
      this.searchBtn.disabled = false;
    }
  }

  async geocodeLocation(locationName) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1&addressdetails=1`,
        {
          headers: { "User-Agent": "ParkEase-App/1.0" },
        },
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name.split(",")[0],
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return null;
  }

  setupLocationButton() {
    const searchBox = document.querySelector(".search-box");
    if (searchBox && !document.getElementById("locationBtn")) {
      const locationBtn = document.createElement("button");
      locationBtn.id = "locationBtn";
      locationBtn.innerHTML = "📍";
      locationBtn.className = "location-btn";
      locationBtn.title = "Use my current location";
      locationBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 1.3rem;
                cursor: pointer;
                padding: 8px;
                border-radius: 50%;
                transition: all 0.3s;
            `;

      locationBtn.addEventListener("mouseenter", () => {
        locationBtn.style.background = "#f0f0f0";
      });

      locationBtn.addEventListener("mouseleave", () => {
        locationBtn.style.background = "transparent";
      });

      locationBtn.addEventListener("click", async () => {
        if (!auth.isLoggedIn) {
          showToast("Please login first", "error");
          auth.showLoginModal();
          return;
        }

        // Check if browser supports geolocation
        if (!navigator.geolocation) {
          showToast(
            "Your browser does not support geolocation. Please search manually.",
            "error",
          );
          return;
        }

        showToast("Getting your location... Please allow permission.", "info");

        try {
          const position = await this.getUserLocation();
          const { latitude, longitude } = position.coords;

          showToast(
            "Location found! Searching for parking spots...",
            "success",
          );

          const locationName = await this.getLocationName(latitude, longitude);

          localStorage.setItem(
            "searchCoordinates",
            JSON.stringify({
              lat: latitude,
              lng: longitude,
            }),
          );
          localStorage.setItem(
            "searchLocation",
            locationName || "Your Current Location",
          );

          showToast(
            `Showing parking near ${locationName || "your location"}!`,
            "success",
          );
          window.location.href = "/map";
        } catch (error) {
          console.error("Location error:", error);

          // Different error messages based on error type
          if (error.code === 1) {
            // PERMISSION_DENIED
            showToast(
              "Location permission denied. Please allow location access in browser settings and refresh the page.",
              "error",
            );
          } else if (error.code === 2) {
            // POSITION_UNAVAILABLE
            showToast(
              "Unable to get your location. Please check your internet connection and try again.",
              "error",
            );
          } else if (error.code === 3) {
            // TIMEOUT
            showToast(
              "Location request timed out. Please try again or search manually.",
              "error",
            );
          } else {
            showToast(
              "Unable to get your location. Please search manually using the search box.",
              "error",
            );
          }
        }
      });

      searchBox.insertBefore(locationBtn, this.searchBtn);
    }
  }

  // Custom promise wrapper for geolocation with timeout
  getUserLocation() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject({ code: 3, message: "Timeout" });
      }, 10000); // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        {
          enableHighAccuracy: false, // Set to false for faster response
          timeout: 8000,
          maximumAge: 60000, // Cache location for 1 minute
        },
      );
    });
  }

  async getLocationName(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: { "User-Agent": "ParkEase-App/1.0" },
        },
      );
      const data = await response.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        null
      );
    } catch (error) {
      return null;
    }
  }
}

export const searchHandler = new SearchHandler();
