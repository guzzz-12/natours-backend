const mongoose = require("mongoose");
const validator = require("validator");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review can't be empty"]
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Review must belong to a tour"]
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review must have an author"]
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

//Agregar la información del tour y del autor del review correspondientes a sus ID
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: "tour",
    select: "name"
  });
  this.populate({
    path: "author",
    select: "name"
  });
  next()
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;