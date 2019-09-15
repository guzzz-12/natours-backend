const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const EmailSender = require("../utils/emailSender");
const crypto = require("crypto");
const {validationErrors, duplicateDataErrors} = require("../utils/dataErrorsHandler");

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

//Crear y enviar cookie con el token al cliente
const createTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    // secure: process.env.NODE_ENV === "production" ? true : false,
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  });
}

//Crear un nuevo usuario
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: Date.now()
    });

    const url = `${req.protocol}://${req.get("host")}/me`;
    
    await new EmailSender(newUser, url).sendWelcome();
    
    const token = signToken(newUser._id);
    
    //Enviar el cookie
    createTokenCookie(res, token);

    //Excluir el password de la respuesta al crear el usuario
    newUser.password = null;

    res.status(201).json({
      status: "success",
      token: token,
      data: {
        user: newUser
      }
    })
    
  } catch(error) {
    let err = Object.create(error);

    if (process.env.NODE_ENV === "production") {
      if (err.name === "ValidationError") {
        err = validationErrors(error)
      }
      
      if(err.code === 11000) {
        err = duplicateDataErrors(error)
      }
    }

    return next(new ErrorHandler(err, 400));
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

    createTokenCookie(res, token);

    res.status(200).json({
      status: "success",
      token: token
    })
  } catch(error) {
    let err = Object.create(error);

    if (process.env.NODE_ENV === "production") {
      if (err.name === "ValidationError") {
        err = validationErrors(error)
      }
    }

    return next(new ErrorHandler(err, 400));
  }
}

//Cerrar sesión de usuario
exports.logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: "success"
  })
}

//Permitir el acceso a un recurso sólo cuando el usuario está autenticado
exports.protectRoutes = async (req, res, next) => {
  try {
    let token;
    //Chequear si existe el token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return next(new ErrorHandler("You need to be logged in to access this page", 401));
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

    //Enviar el usuario actual al resto de los routes que requieren autenticación
    req.user = currentUser;

    //Enviar el usuario actual a las variables locales para acceder a éste en los templates
    res.locals.user = currentUser;
    
    //Si el usuario cumple con todos los pasos de verificación, concederle acceso al recurso solicitado
    next()

  } catch(error) {
    let err = Object.create(error);
    
    if (process.env.NODE_ENV === "production") {
      err = tokenError(error.name)
    }

    return next(new ErrorHandler(err, 401));
  }
}

//Chequear si el usuario está logueado para renderizar condicionalmente elementos en las páginas
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //Chequear si el token es válido
      const decodedToken = await jwt.verify(req.cookies.jwt, jwtSecret);
      
      //Chequear si el usuario existe
      const currentUser = await User.findById(decodedToken.id);
      if (!currentUser) {
        return next()
      }
  
      //Chequear si el usuario cambió la contraseña después de crear el token
      if (currentUser.changedPassword(decodedToken.iat)) {
        return next()
      }    
  
      //Variable locals con el usuario logueado
      //Las variables locals son accesibles por los templates
      res.locals.user = currentUser
      return next()      
    }
    return next()

  } catch(error) {
    return next()
  }
}

//Permitir el acceso sólo a usuarios que cumplan con el rol especificado
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new ErrorHandler("You don't have permission to perform this action", 403))
    }
    next()
  }
}

//Enviar correo de confirmación de restablecimiento de contraseña en caso de que el usuario lo solicite por olvido de su contraseña actual
exports.forgotPassword = async (req, res, next) => {
  try {
    //Tomar el usuario según su email
    const user = await User.findOne({email: req.body.email})
    if (!user) {
      return next(new ErrorHandler("There's no user with the provided email address", 404))
    }

    //Generar el token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false})

    //Enviarle el email con el token de reseteo de password
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your password and password confirmation to ${resetUrl}`

    // await EmailSender({
    //   email: user.email,
    //   subject: "Your password reset token is valid for 10 minutes",
    //   message
    // });

    res.status(200).json({
      status: "success",
      message: "Token sent"
    });

  } catch(error) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save({validateBeforeSave: false});

    if(process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("There was an problem sending the email", 400));
    }
    
    return next(new ErrorHandler(error, 400));
  }
}

//Utilizar la data del correo de confirmación enviado para proceder a crear una nueva contraseña
exports.resetPassword = async (req, res, next) => {
  try {
    //Tomar el usuario correspondiente al token y verificar que el token no haya expirado
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {$gt: Date.now()}
    });

    //Modificar el password sólo si el usuario existe y si el token es válido
    if (!user) {
      return next(new ErrorHandler("Invalid or expired token", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();    

    //Loguear el usuario y enviar el token al cliente
    const token = signToken(user._id);

    createTokenCookie(res, token);

    res.status(200).json({
      status: "success",
      token: token
    })

  } catch(error) {
    let err = Object.create(error);

    if (process.env.NODE_ENV === "production") {
      err = validationErrors(error)
    }

    return next(new ErrorHandler(err, 400));
  }
}

//Actualizar la contraseña en caso de que el usuario desee modificarla
exports.updatePassword = async (req, res, next) => {
  try {
    //Tomar el usuario actual
    const user = await User.findById(req.user.id).select("+password");
  
    //Chequear si la contraseña es correcta
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new ErrorHandler("Wrong password", 401))
    }
  
    //Si la contraseña es correcta, actualizarla
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //Loguear el usuario, enviar el token
    const token = signToken(user._id);

    createTokenCookie(res, token);

    res.status(200).json({
      status: "success",
      token: token
    })

  } catch(error) {
    let err = Object.create(error);

    if (process.env.NODE_ENV === "production") {
      err = validationErrors(error)
    }

    return next(new ErrorHandler(err, 400));
  }
}