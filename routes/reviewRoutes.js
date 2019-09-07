const express = require("express");
const {getReviews, getSingleReview, createReview, deleteReview, editReview} = require("../controllers/reviewController");
const {protectRoutes, restrictTo} = require("../controllers/authController")

const router = express.Router({mergeParams: true});

router.route("/")
.get(protectRoutes, getReviews)
.post(protectRoutes, restrictTo("user"), createReview)

router.route("/:id")
.get(protectRoutes, getSingleReview)
.delete(protectRoutes, restrictTo("user", "admin"), deleteReview)
.patch(protectRoutes, restrictTo("user", "admin"), editReview)

module.exports = router;