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
  role: {
    type: String,
    enum:  ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "You must provide a password"],
    select: false,
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
    select: false,
    validate: {
      //Sólo se valida al crear un nuevo user con save() y create()
      validator: function(val) {
        return val === this.password
      },
      message: "Passwords don't match"
    }
  },
  passwordChangedAt: Date
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

//Verificar si la contraseña ingresada es correcta
userSchema.methods.correctPassword = async function(providedPassword, realPassword) {
  return await bcrypt.compare(providedPassword, realPassword);
}

//Verificar si la contraseña ha sido modificada
userSchema.methods.changedPassword = function(timestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
    
    return timestamp < changedTimeStamp;
  }
  return false;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
