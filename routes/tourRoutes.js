const express = require("express");
const {getTours, getSingleTour, createTour, editTour, deleteTour, getTourStats, getMonthlyPlan} = require("../controllers/tourController");
const {protectRoutes, restrictTo} = require("../controllers/authController")

const router = express.Router();

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/")
.get(protectRoutes, getTours)
.post(createTour);

router.route("/:id")
.get(getSingleTour)
.patch(editTour)
.delete(protectRoutes, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;