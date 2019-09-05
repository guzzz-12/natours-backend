const Review = require("../models/reviewModel");

//Tomar todos los reviews
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find();

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