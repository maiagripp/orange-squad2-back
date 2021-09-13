const mongoose = require("../index");

const ReminderSchema = new mongoose.Schema({
  note: {
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

const Reminder = mongoose.model("Reminder", ReminderSchema);

module.exports = Reminder;
