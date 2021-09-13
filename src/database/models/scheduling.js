const mongoose = require("../index");

const SchedulingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  chair: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chair",
    required: true,
  },
  place: {
    type: String,
    required: true,
    lowercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Scheduling = mongoose.model("Scheduling", SchedulingSchema);

module.exports = Scheduling;
