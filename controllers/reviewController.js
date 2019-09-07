const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

//Leer todos los reviews
exports.getReviews = factory.getAll(Review);

//Leer la información de un review
exports.getSingleReview = factory.getOne(Review);

//Crear review
exports.createReview = factory.createOne(Review);

//Actualizar review
exports.editReview = factory.updateOne(Review);

//Borrar review
exports.deleteReview = factory.deleteOne(Review);