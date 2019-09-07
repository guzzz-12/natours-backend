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
exports.createReview = async (req, res, next) => {
  try {
    if (!req.body.tour) {
      req.body.tour = req.params.tourId;
    }
    if (!req.body.author) {
      req.body.author = req.user.id
    }

    const newReview = await Review.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        newReview
      }
    })

  } catch(error){
    res.status(400).json({
      status: "fail",
      message: error
    })
  }
}

//Actualizar review
exports.editReview = factory.updateOne(Review);

//Borrar review
exports.deleteReview = factory.deleteOne(Review);