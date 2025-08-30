const express = require("express");
const Record = require("../models/Record");
const { auth } = require('express-oauth2-jwt-bearer');

const router = express.Router();

// Auth0 middleware configuration
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Middleware to check API key
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.BACKEND_API_KEY) {
    return res.status(401).json({ message: "Invalid API key" });
  }
  next();
};

// Create a new record
router.post("/", jwtCheck, apiKeyMiddleware, async (req, res) => {
  try {
    const record = new Record(req.body);
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save record" });
  }
});

// Get all records (newest first)
router.get("/", jwtCheck, apiKeyMiddleware, async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch records" });
  }
});

// Get statistics
router.get("/stats", jwtCheck, apiKeyMiddleware, async (req, res) => {
  try {
    const totalRecords = await Record.countDocuments();
    const uniqueCountries = await Record.distinct("country");
    
    res.json({
      totalRecords,
      uniqueCountriesCount: uniqueCountries.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// Delete a record by ID
router.delete("/:id", jwtCheck, apiKeyMiddleware, async (req, res) => {
  try {
    const deleted = await Record.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete record" });
  }
});

// Air quality endpoint (placeholder - needs implementation)
router.get("/geo/airquality", jwtCheck, apiKeyMiddleware, async (req, res) => {
  try {
    const { city } = req.query;
    // This is a placeholder - you'll need to implement actual air quality API integration
    // For now, returning mock data
    res.json({
      results: [
        {
          parameter: "pm25",
          value: Math.floor(Math.random() * 100) + 1,
          unit: "µg/m³"
        }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch air quality data" });
  }
});

module.exports = router;