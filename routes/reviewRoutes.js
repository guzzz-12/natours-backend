const express = require("express");
const {getReviews, createReview, deleteReview} = require("../controllers/reviewController");
const {protectRoutes, restrictTo} = require("../controllers/authController")

const router = express.Router({mergeParams: true});

router.route("/")
.get(getReviews)
.post(protectRoutes, restrictTo("user"), createReview)

router.route("/:id")
.delete(protectRoutes, restrictTo("admin"), deleteReview)

module.exports = router;