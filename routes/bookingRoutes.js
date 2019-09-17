const express = require("express");
const {getCheckoutSession, getAllBookings, createBooking, getBooking, updateBooking, deleteBooking} = require("../controllers/bookingController");
const {protectRoutes, restrictTo} = require("../controllers/authController")

const router = express.Router();

router.get("/checkout-session/:tourId", protectRoutes, getCheckoutSession);

router.route("/")
.get(protectRoutes, restrictTo("admin", "lead-guide"), getAllBookings)
.post(protectRoutes, restrictTo("admin", "lead-guide"), createBooking)

router.route("/:id")
.get(protectRoutes, restrictTo("admin", "lead-guide"), getBooking)
.patch(protectRoutes, restrictTo("admin", "lead-guide"), updateBooking)
.delete(protectRoutes, restrictTo("admin", "lead-guide"), deleteBooking)

module.exports = router;