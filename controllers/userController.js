const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("./handlerFactory");


//Mostrar errores de validación
const validationErrors = (err) => {
  const errorProperties = Object.values(err.errors)
  let allErrors = errorProperties.map((error) => {
    return `${error.message}.`
  })
  const message = `Invalid data: ${allErrors.join(" ")}`
  return new ErrorHandler(message, 400).message
}


//Tomar la data de todos los usarios
exports.getAllUsers = factory.getAll(User);

//Leer la información de un usuario
exports.getUser = factory.getOne(User);

//Actualizar la información del usuario
exports.updateMe = async (req, res, next) => {
  try {

    //Campos permitidos
    const allowedData = ["name", "email"];
    
    //Retornar errorsi el usuario intenta actualizar un campo no permitido
    let requestKeys = Object.keys(req.body);
    requestKeys.forEach(key => {
      if (!allowedData.includes(key)) {
        return next(new ErrorHandler("This route is only for Name and Email updates", 400))
      }
    })

    //Crear el objeto con los datos a actualizar
    let dataToUpdate = {}
    for(let key of requestKeys) {
      dataToUpdate[key] = req.body[key]
    }
  
    // Actualizar los datos del usuario
    const user = await User.findByIdAndUpdate(req.user.id, dataToUpdate, {new: true, runValidators: true});

    res.status(200).json({
      status: "success",
      message: "User data successfully updated",
      data: {
        user
      }
    })

  } catch(error) {
    let err = {...error}
    if (process.env.NODE_ENV === "production" && err.name === "ValidationError") {
      err = validationErrors(error)
    }
    res.status(400).json({
      status: "fail",
      message: err
    })
  }

}

//Desactivar la cuenta del usuario
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
      status: success,
      data: null
    })
  } catch(error) {
    res.status(400).json({
      status: "fail",
      message: error
    })
  }
}

//Crear usuario
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
};

//Actualizar usuario
exports.updateUser = factory.updateOne(User);

//Borrar usuario
exports.deleteUser = factory.deleteOne(User);