import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from 'public' folder
app.use(express.static("public"));

// Serve the main landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve the map page
app.get("/map", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "map.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 ParkEase server is running!`);
  console.log(`📱 Landing Page: http://localhost:${PORT}`);
  console.log(`🗺️ Map Page: http://localhost:${PORT}/map`);
});
