const express = require("express");
const {getTours, getSingleTour, createTour, editTour, deleteTour} = require("../controllers/tourController");

const router = express.Router();

router.route("/")
.get(getTours)
.post(createTour);

router.route("/:id")
.get(getSingleTour)
.patch(editTour)
.delete(deleteTour);

module.exports = router;