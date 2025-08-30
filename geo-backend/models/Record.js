const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    metadata: {
      capital: String,
      population: Number,
      currency: String,
      languages: [String],
      flag: String,
    },
    weather: {
      temperature: Number,
      humidity: Number,
      description: String,
    },
    airQuality: {
      parameter: String,
      value: Number,
      unit: String,
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const Record = mongoose.model("Record", recordSchema);

module.exports = Record;
