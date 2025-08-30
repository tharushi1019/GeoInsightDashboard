import express from "express";
import Record from "../models/Record.js";

const router = express.Router();

// Middleware to check API key
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.BACKEND_API_KEY) {
    return res.status(401).json({ message: "Invalid API key" });
  }
  next();
};

// Create a new record
router.post("/", apiKeyMiddleware, async (req, res) => {
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
router.get("/", apiKeyMiddleware, async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch records" });
  }
});

// Delete a record by ID
router.delete("/:id", apiKeyMiddleware, async (req, res) => {
  try {
    const deleted = await Record.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete record" });
  }
});

export default router;
