const ErrorHandler = require("../utils/errorHandler");

//Función para mostrar errores de ID no válida
const castErrors = (err) => {
  const newMessage = `Invalid ${err.path}: ${err.value}`
  return new ErrorHandler(newMessage, 404).message
}

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