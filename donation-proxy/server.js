// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend access

const HOSTEDSHOP_API_BASE =
  "https://shop.givenpigeret.dk/json/productvariants/data";
const API_CLIENT_ID = "1"; // Replace with your actual client ID
const API_SECRET = "your-secret-key"; // Replace with your actual secret

// Optional: If Hostedshop requires headers or token auth, add it here
const axiosConfig = {
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${API_CLIENT_ID}:${API_SECRET}`
    ).toString("base64")}`,
  },
};

app.get("/api/donation-options", async (req, res) => {
  try {
    const [oneTime, recurring] = await Promise.all([
      axios.get(`${HOSTEDSHOP_API_BASE}/14`, axiosConfig),
      axios.get(`${HOSTEDSHOP_API_BASE}/62`, axiosConfig),
    ]);

    res.json({
      engangsbidrag: oneTime.data.variants,
      fastbidrag: recurring.data.variants,
    });
  } catch (error) {
    console.error("Error fetching donation data:", error.message);
    res.status(500).json({ error: "Failed to fetch donation options" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Donation proxy running on port ${PORT}`);
});
