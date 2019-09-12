const express = require("express");
const {getOverview, getTour, login, getAccount} = require("../controllers/viewsController");
const authController = require("../controllers/authController");

const router = express.Router();

//Rutas a los views
router.get("/", authController.isLoggedIn, getOverview);
router.get("/tours/:tourSlug", authController.isLoggedIn, getTour);
router.get("/login", authController.isLoggedIn, login);
router.get("/me", authController.protectRoutes, getAccount)

module.exports = router;