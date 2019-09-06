const express = require("express");
const {getReviews, createReview} = require("../controllers/reviewController");
const {protectRoutes, restrictTo} = require("../controllers/authController")

const router = express.Router({mergeParams: true});

router.route("/")
.get(getReviews)
.post(protectRoutes, restrictTo("user"), createReview)

module.exports = router;