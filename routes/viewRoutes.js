const express = require("express");
const {getOverview, getTour, login, signup, getAccount, getMyTours, addReview} = require("../controllers/viewsController");
const {isLoggedIn, protectRoutes} = require("../controllers/authController");
const {createBookingCheckout} = require("../controllers/bookingController");

const router = express.Router();

//Rutas a los views
router.get("/", createBookingCheckout, isLoggedIn, getOverview);
router.get("/tours/:tourSlug", isLoggedIn, getTour);
router.get("/my-tours", protectRoutes, getMyTours);
router.get("/tours/:tourId/add-review", protectRoutes, addReview);

router.get("/login", isLoggedIn, login);
router.get("/signup", signup);
router.get("/me", protectRoutes, getAccount);

module.exports = router;