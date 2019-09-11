const express = require("express");
const {getOverview, getTour, login} = require("../controllers/viewsController");
const authController = require("../controllers/authController");

const router = express.Router();

//Chequear si hay usuario logueado
router.use(authController.isLoggedIn);

//Rutas a los views
router.get("/", getOverview);
router.get("/tours/:tourSlug", getTour);
router.get("/login", login);

module.exports = router;