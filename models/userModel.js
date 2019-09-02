const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "You must provide an email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid email"]
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, "You must provide a password"],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, "You must confirm your password"]
  }
})

const User = mongoose.model("User", userSchema);

module.exports = User;
