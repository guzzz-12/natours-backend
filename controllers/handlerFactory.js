const ErrorHandler = require("../utils/errorHandler");
const APIFeatures = require("../utils/apiFeatures");

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

//Leer la información de un documento
exports.getOne = (Model, populateOptions) => {
  return async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id || req.user.id);

      //Chequear si el documento solicitado requiere ejecutar populate()
      if (populateOptions) {
        query = query.populate(populateOptions);
      }

      const document = await query;
  
      if(!document) {
        return next(new ErrorHandler("No document found for that ID", 404))
      }
  
      res.status(200).json({
        status: "success",
        data: {
          data: document
        }
      });
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

//Leer la data de todos los documentos de una colección
exports.getAll = (Model) => {  
  return async (req, res, next) => {
    try {
      //Filtrar los tours por la ID especificada en la URL
      let filter = {}
      if (req.params.tourId) {
        filter = {tour: req.params.tourId}
      }

      //Ejecutar el query para filtrar, ordenar, limitar y paginar los documentos
      const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

      const documents = await features.query;
  
      res.status(200).json({
        status: "success",
        results: documents.length,
        data: {
          data: documents
        }
      })

    } catch (error) {
      res.status(404).json({
        status: "fail",
        message: error
      })
    }
  }
}