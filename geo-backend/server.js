const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const recordsRoutes = require("./routes/recordsRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/records", recordsRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error: " + err));

// Test Route
app.get("/", (req, res) => {
  res.send("GeoInsight API Running 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
