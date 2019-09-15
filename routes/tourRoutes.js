const express = require("express");
const {getTours, getSingleTour, createTour, editTour, deleteTour, getTourStats, getMonthlyPlan, getToursWithin, getDistances, uploadTourImages, resizeTourImages} = require("../controllers/tourController");
const {protectRoutes, restrictTo} = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year")
.get(protectRoutes, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

//Obtener los tours cuya ubicación (startLocation) se encuentre dentro de la distancia determinada en los parámetros de la URL
router.route("/tours-within/:distance/center/:latlon/unit/:unit")
.get(getToursWithin);

//Calcular las distancias de los tours que se encuentren dentro de la distancia especificada
router.route("/distances/:latlon/unit/:unit")
.get(getDistances);

router.route("/")
.get(getTours)
.post(protectRoutes, restrictTo("admin", "lead-guide"), createTour);

router.route("/:id")
.get(getSingleTour)
.patch(protectRoutes, restrictTo("admin", "lead-guide"), uploadTourImages, resizeTourImages, editTour)
.delete(protectRoutes, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;