const express = require("express");
const {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe} = require("../controllers/userController");
const {signup, login, forgotPassword, resetPassword, protectRoutes, restrictTo, updatePassword} = require("../controllers/authController")

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", protectRoutes, updatePassword);

router.patch("/updateMe", protectRoutes, updateMe);
router.delete("/deleteMe", protectRoutes, deleteMe);

router.route("/")
.get(getAllUsers)
.post(createUser);

router.route("/:id")
.get(getUser)
.patch(updateUser)
.delete(protectRoutes, restrictTo("admin"), deleteUser);

module.exports = router;