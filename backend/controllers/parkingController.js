import pool from "../config/db.js";

// Punjab cities with correct mappings
const cityDatabase = {
  amritsar: ["amritsar", "amritsar city", "guru ka bagh", "golden temple"],
  jalandhar: ["jalandhar", "jalandhar city", "model town", "jalandhar cantt"],
  ludhiana: ["ludhiana", "ludhiana city", "civil lines", "paudi road"],
  chandigarh: [
    "chandigarh",
    "chandigarh city",
    "sector",
    "sector 17",
    "elante",
  ],
  patiala: ["patiala", "patiala city", "urban estate", "qila mubarak"],
  bathinda: ["bathinda", "batinda", "bathinda city", "mall road"],
  mohali: [
    "mohali",
    "sas nagar",
    "sahibzada ajit singh nagar",
    "north country",
    "vr punjab",
  ],
  phagwara: ["phagwara", "phagwara city", "guru nanak mission"],
};

export const getParkingSpots = async (req, res) => {
  try {
    const { city } = req.query;

    let query = `SELECT *, 
                    (available_spots::float / total_spots::float * 100) as occupancy_rate,
                    CASE 
                        WHEN available_spots = 0 THEN 'full'
                        WHEN available_spots <= 3 THEN 'limited'
                        ELSE 'available'
                    END as status
                    FROM parking_spots 
                    WHERE is_active = true`;
    let params = [];

    if (city) {
      const cityLower = city.toLowerCase().trim();

      // Find which city this belongs to
      let matchedCity = null;
      for (const [mainCity, keywords] of Object.entries(cityDatabase)) {
        if (keywords.some((keyword) => cityLower.includes(keyword))) {
          matchedCity = mainCity;
          break;
        }
      }

      // If no match found, check if it's a Punjab city directly
      const isPunjabCity = Object.keys(cityDatabase).some(
        (mainCity) => cityLower === mainCity || cityLower.includes(mainCity),
      );

      if (!isPunjabCity && !matchedCity) {
        return res.json({
          success: true,
          count: 0,
          comingSoon: true,
          message:
            "🚧 More locations coming soon! Currently available in Punjab only.",
          spots: [],
        });
      }

      // Use matched city or the lowercase input
      const searchCity = matchedCity || cityLower;
      query += " AND LOWER(city) = $1";
      params.push(searchCity);
    }

    query += " ORDER BY available_spots DESC, rating DESC";

    const result = await pool.query(query, params);

    if (result.rows.length === 0 && city) {
      return res.json({
        success: true,
        count: 0,
        noSpots: true,
        message:
          "📍 No parking locations found in this area. Try nearby cities like Amritsar, Jalandhar, Ludhiana!",
        spots: [],
      });
    }

    res.json({
      success: true,
      count: result.rows.length,
      region: "Punjab",
      spots: result.rows,
    });
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getParkingSpotById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM parking_spots WHERE id = $1 AND is_active = true",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Parking spot not found" });
    }

    res.json({
      success: true,
      spot: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching parking spot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, city, available_spots, total_spots, 
                    (available_spots::float / total_spots::float * 100) as occupancy_rate,
                    next_available_time, last_updated
             FROM parking_spots 
             WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Parking spot not found" });
    }

    const spot = result.rows[0];

    let status = "available";
    if (spot.available_spots === 0) status = "full";
    else if (spot.available_spots <= 3) status = "limited";

    res.json({
      success: true,
      availability: {
        available: spot.available_spots,
        total: spot.total_spots,
        occupancyRate: Math.round(spot.occupancy_rate),
        status: status,
        nextAvailableTime: spot.next_available_time,
        lastUpdated: spot.last_updated,
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};
