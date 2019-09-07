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

//Función para mostrar errores de data duplicada
const duplicateDataErrors = (err) => {
  const value = err.errmsg.split(":")
  const message = `Duplicate field: ${value[value.length - 1].replace(" \"", "").replace("\" }", "")}. Please try another name.`;
  return new ErrorHandler(message, 400).message
}

//Función para mostrar errores de ID no válida
const castErrors = (err) => {
  const newMessage = `Invalid ${err.path}: ${err.value}`
  return new ErrorHandler(newMessage, 404).message
}


//------Operaciones CRUD------//

//Borrar un documento
exports.deleteOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
  
      if(!doc) {
        return next(new ErrorHandler("No document found for that ID", 404))
      }
  
      res.status(204).json({
        status: "success",
        data: {
          doc: null
        }
      })
    } catch (error) {
      let err = {...error}
      
      if (process.env.NODE_ENV === "production") {
        if(error.name === "CastError") {
          err = castErrors(error)
        }
      }
  
      res.status(404).json({
        status: "fail",
        message: err
      })
    }
  }
}

//Actualizar un documento
exports.updateOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
  
      if(!doc) {
        return next(new ErrorHandler("No document found for that ID", 404))
      }
  
      res.status(200).json({
        status: "success",
        data: {
          data: doc
        }
      })
    } catch (error) {
      let err = {...error}
      if (process.env.NODE_ENV === "production") {
        if (err.name === "ValidationError") {
          err = validationErrors(error)
        }
  
        if(err.code === 11000) {
          err = duplicateDataErrors(error)
        }
  
        if(error.name === "CastError") {
          err = castErrors(error)
        }
      }
      res.status(404).json({
        status: "fail",
        message: err
      })
    }
  }
}

//Crear un documento
exports.createOne = (Model) => {
  return async (req, res) => {
    //Si se va a crear un review tomando la ID desde los parámetros dela URL, hacer:
    if (Model.modelName === "Review") {
      if (!req.body.tour) {
        req.body.tour = req.params.tourId;
      }
      if (!req.body.author) {
        req.body.author = req.user.id
      }
    }

    try {
      const newDoc = await Model.create(req.body);
    
      res.status(201).json({
        status: "success",
        data: {
          data: newDoc
        }
      })

    } catch (error) {
      let err = {...error}
      if (process.env.NODE_ENV === "production") {
        if (err.code === 11000) {
          err = duplicateDataErrors(error)
        }
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
}