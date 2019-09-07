const express = require("express");
const {getReviews, createReview, deleteReview, editReview} = require("../controllers/reviewController");
const {protectRoutes, restrictTo} = require("../controllers/authController")

const router = express.Router({mergeParams: true});

router.route("/")
.get(getReviews)
.post(protectRoutes, restrictTo("user"), createReview)

router.route("/:id")
.delete(protectRoutes, restrictTo("admin"), deleteReview)
.patch(protectRoutes, editReview)

module.exports = router;