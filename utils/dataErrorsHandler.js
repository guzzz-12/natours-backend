const ErrorHandler = require("./errorHandler");

//Función para mostrar errores de validación
exports.validationErrors = (err) => {
  const errorProperties = Object.values(err.errors)
  let allErrors = errorProperties.map((error) => {
    return `${error.message}.`
  })
  const message = `Invalid data: ${allErrors.join(" ")}`
  return new ErrorHandler(message, 400).message
}

//Función para mostrar errores de data duplicada
exports.duplicateDataErrors = (err) => {
  const value = err.errmsg.split(":");
  const duplicatedField = value[2].split(" ")[1].split("_")[0];
  const message = `${duplicatedField.toUpperCase()} already in use: ${value[value.length - 1].replace(" \"", "").replace("\" }", "")}. Please try another ${duplicatedField}.`;
  return new ErrorHandler(message, 400).message
}

//Función para mostrar errores de ID no válida
exports.castErrors = (err) => {
  const newMessage = `Invalid ${err.path}: ${err.value}`
  return new ErrorHandler(newMessage, 404).message
}