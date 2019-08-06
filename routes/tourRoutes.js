const express = require("express");
const {checkId, checkBodyData, getTours, getSingleTour, createTour, editTour, deleteTour} = require("../controllers/tourController");

const router = express.Router();

router.param("id", checkId);

router.route("/")
.get(getTours)
.post(checkBodyData, createTour);

router.route("/:id")
.get(getSingleTour)
.patch(editTour)
.delete(deleteTour);

module.exports = router;