const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("./handlerFactory");
const multer = require("multer");
const sharp = require("sharp");


//Configuración de multer para crear las imágenes de avatar
    //La imagen se almacena temporalmente en la memoria hasta que se guarda luego de procesarla con Sharp
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true)
  } else {
    callback(new ErrorHandler("Please upload only image files", 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single("photo");

//Redimensionar el tamaño de las imágenes de avatar y guardarlas
exports.resizeUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next()
    }
  
    req.file.filename = `user-${req.user.id}.jpeg`
  
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);
  
    next();

  } catch(error) {
    if (process.env.NODE_ENV === "production") {
      return next(new ErrorHandler("There was a problem uploading the images, try again.", 400))
    }
    return next(new ErrorHandler(error, 400))
  }
}

//Mostrar errores de validación
const validationErrors = (err) => {
  const errorProperties = Object.values(err.errors)
  let allErrors = errorProperties.map((error) => {
    return `${error.message}.`
  })
  const message = `Invalid data: ${allErrors.join(" ")}`
  return new ErrorHandler(message, 400).message
}


//Actualizar la información del usuario
exports.updateMe = async (req, res, next) => {
  try {
    //Campos permitidos
    const allowedData = ["name", "email"];
    
    //Retornar error si el usuario intenta actualizar un campo no permitido
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

    //Agregar la imagen actualizada en caso de que el usuario actualice su avatar
    if (req.file) {
      dataToUpdate["photo"] = req.file.filename
    }
    
    // Actualizar los datos del usuario
    const user = await User.findByIdAndUpdate(req.user.id, dataToUpdate, {new: true, runValidators: true});

    if (!user) {
      return next(new ErrorHandler("User not found.", 404))
    }
    
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
    return next(new ErrorHandler(err, 400))
  }
}

//Desactivar la cuenta del usuario
exports.deleteMe = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, {active: false});

    if (!user) {
      return next(new ErrorHandler("User not found.", 404))
    }

    res.status(204).json({
      status: success,
      data: null
    })
  } catch(error) {
    return next(new ErrorHandler(err, 400))
  }
}

//Crear usuario
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
};

//Tomar la data de todos los usarios
exports.getAllUsers = factory.getAll(User);

//Leer la información de un usuario
exports.getUser = factory.getOne(User);

//Actualizar usuario
exports.updateUser = factory.updateOne(User);

//Borrar usuario
exports.deleteUser = factory.deleteOne(User);
