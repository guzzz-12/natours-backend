const express = require("express");
const {getOverview, getTour} = require("../controllers/viewsController")

const router = express.Router();

//Rutas a los views
router.get("/", getOverview);
router.get("/tours/:tourSlug", getTour);

module.exports = router;