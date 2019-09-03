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

// Validar el token del usuario cuando éste intenta acceder a una ruta protegida
const tokenError = (errName) => {
  let newMessage = null;
  if (errName === "JsonWebTokenError") {
    newMessage = "Invalid token: You're not authorized to access this resource"
  }
  if (errName === "TokenExpiredError") {
    newMessage = "Your session expired: Please, login again"
  }
  return new ErrorHandler(newMessage, 401).message
}

//Crear un nuevo usuario
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt
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

exports.protectRoutes = async (req, res, next) => {
  try {
    let token;
    //Chequear si existe el token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      return next(new ErrorHandler("You need to be logged in to access", 401));
    }

    //Chequear si el token es válido
    const decodedToken = await jwt.verify(token, jwtSecret);
    
    //Chequear si el usuario existe
    const currentUser = await User.findById(decodedToken.id);
    if (!currentUser) {
      return next(new ErrorHandler("This user no longer exist in the database", 401))
    }

    //Chequear si el usuario cambió la contraseña después de crear el token
    if (currentUser.changedPassword(decodedToken.iat)) {
      return next(new ErrorHandler("User changed password, please login again", 401))
    }    

    req.user = currentUser;
    
    //Si el usuario cumple con todos los pasos de verificación, concederle acceso al recurso solicitado
    next()

  } catch(error) {
    let err = {...error}
    if (process.env.NODE_ENV === "production") {
      err = tokenError(error.name)
    }
    res.status(401).json({
      status: "fail",
      message: err
    })
  }
}

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new ErrorHandler("You don't have permission to perform this action", 403))
    }
    next()
  }
}