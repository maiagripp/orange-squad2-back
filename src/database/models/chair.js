const mongoose = require("../index");

const ChairSchema = new mongoose.Schema({
  chair: {
    type: Number,
    unique: true,
    required: true,
  },
  scheduling: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheduling",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chair = mongoose.model("Chair", ChairSchema);

module.exports = Chair;
