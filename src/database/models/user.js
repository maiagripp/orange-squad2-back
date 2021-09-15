const mongoose = require("../index");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  squad: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  adress: {
    type: String,
  },
  image: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  scheduling: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Scheduling",
    },
  ],
  reminder: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Reminder",
    },
  ],
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
