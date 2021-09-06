const mongoose = require("../index");

const SchedulingSchema = new mongoose.Schema({
  data: {
    type: Date,
    required: true,
  },
  chair: {
    type: Number,
    unique: true,
    required: true,
  },
  local: {
    type: String,
    required: true,
    lowercase: true,
  },
  assignedTo: {
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
