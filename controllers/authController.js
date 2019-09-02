const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");

//Función para mostrar errores de validación
const validationErrors = (err) => {
  const errorProperties = Object.values(err.errors)
  let allErrors = errorProperties.map((error) => {
    return `${error.message}.`
  })
  const message = `Invalid data: ${allErrors.join(" ")}`
  return new ErrorHandler(message, 400).message
}

//Crear el token de autenticación de usuarios
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION

const signToken = (id) => {
  return jwt.sign({id: id}, jwtSecret, {
    expiresIn: jwtExpiration
  });
}

//Crear un nuevo usuario
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    })

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token: token,
      data: {
        user: newUser
      }
    })
  } catch(error) {
    let err = {...error}
    if (process.env.NODE_ENV === "production") {
      if (err.name === "ValidationError") {
        err = validationErrors(error)
      }
    }
    res.status(400).json({
      status: "fail",
      message: err
    })
  }
}

//Login de usuarios
exports.login = async (req, res, next) => {
  try {
    const {email, password} = req.body;
  
    //Chequear si el usuario ingresó email y contraseña
    if(!email || !password) {
      return next(new ErrorHandler("Please provide email and password", 400))
    }
  
    //Chequear si el usuario existe y el password es correcto
    const user = await User.findOne({email: email}).select("+password");
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new ErrorHandler("Incorrect email or password", 401));
    }    
  
    //Si todo es correcto, enviar el token al cliente
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token: token
    })
  } catch(error) {
    res.status(400).json({
      status: "fail",
      message: error
    })
  }
}