const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
  loginAttempts: Number,
  loginDisabled: Date,
  photo: {
    type: String,
    default: "default.jpg"
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

//Crear propiedad virtual para almacenar los bookings del usuario
userSchema.virtual("bookings", {
  ref: "Booking",
  foreignField: "user",
  localField: "_id"
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

//Actualizar la hora de modificación de la contraseña.
userSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) {
    return next()
  }
  //Restar 1 segundo a la hora de modificación de la contraseña para garantizar que la hora del token en resetPassword sea mayor que la hora de la modificación
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//Filtrar los usuarios inactivos en todos los queries de búsqueda (find)
userSchema.pre(/^find/, function(next) {
  this.find({active: true});
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

//Generar el token para autorizar el reseteo del password del user
userSchema.methods.createPasswordResetToken = function() {
  //Crear el token
  const resetToken = crypto.randomBytes(32).toString("hex");

  //Encriptar el token y almacenarlo en la base de datos
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  //Tiempo de expiración del token de 10 minutos
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //Retornar el token sin encriptar, éste se enviará al email el usuario
  return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
