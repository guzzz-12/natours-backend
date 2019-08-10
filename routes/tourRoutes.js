const express = require("express");
const {getTours, getSingleTour, createTour, editTour, deleteTour, getTourStats, getMonthlyPlan} = require("../controllers/tourController");

const router = express.Router();

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/")
.get(getTours)
.post(createTour);

router.route("/:id")
.get(getSingleTour)
.patch(editTour)
.delete(deleteTour);

module.exports = router;