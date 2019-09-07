const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

//Tomar todos los reviews
exports.getReviews = async (req, res, next) => {
  try {
    let filter = {}
    if (req.params.tourId) {
      filter = {tour: req.params.tourId}
    }
    const reviews = await Review.find(filter);

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews
      }
    })

  } catch(error) {
    res.status(404).json({
      status: "fail",
      message: error
    })
  }
}

//Crear review
exports.createReview = factory.createOne(Review);

//Actualizar review
exports.editReview = factory.updateOne(Review);

//Borrar review
exports.deleteReview = factory.deleteOne(Review);