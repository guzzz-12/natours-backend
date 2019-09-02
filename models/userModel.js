const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    validate: {
      validator: function(val) {
        return val.length >= 8
      },
      message: "Password must be at least 8 characters long"
    }
  },
  passwordConfirm: {
    type: String,
    required: [true, "You must confirm your password"],
    validate: {
      //Sólo se valida al crear un nuevo user con save() y create()
      validator: function(val) {
        return val === this.password
      },
      message: "Passwords don't match"
    }
  }
});

//Encriptar la contraseña del user
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = null;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
