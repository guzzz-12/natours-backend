const express = require("express");
const {getCheckoutSession} = require("../controllers/bookingController");
const {protectRoutes} = require("../controllers/authController")

const router = express.Router();

router.get("/checkout-session/:tourId", protectRoutes, getCheckoutSession);

module.exports = router;