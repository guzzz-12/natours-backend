const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

//Función para mostrar errores de validación
const validationErrors = (err) => {
  const errorProperties = Object.values(err.errors)
  let allErrors = errorProperties.map((error) => {
    return `${error.message}.`
  })
  const message = `Invalid data: ${allErrors.join(" ")}`
  return new ErrorHandler(message, 400).message
}

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body)
    res.status(201).json({
      status: "success",
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