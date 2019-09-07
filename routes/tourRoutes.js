const express = require("express");
const {getTours, getSingleTour, createTour, editTour, deleteTour, getTourStats, getMonthlyPlan} = require("../controllers/tourController");
const {protectRoutes, restrictTo} = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year")
.get(protectRoutes, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

router.route("/")
.get(getTours)
.post(protectRoutes, restrictTo("admin", "lead-guide"), createTour);

router.route("/:id")
.get(getSingleTour)
.patch(protectRoutes, restrictTo("admin", "lead-guide"), editTour)
.delete(protectRoutes, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;