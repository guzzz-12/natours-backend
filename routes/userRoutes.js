const express = require("express");
const {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe} = require("../controllers/userController");
const {signup, login, forgotPassword, resetPassword, protectRoutes, updatePassword} = require("../controllers/authController")

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword", protectRoutes, updatePassword);

router.patch("/updateMe", protectRoutes, updateMe)

router.route("/")
.get(getAllUsers)
.post(createUser);

router.route("/:id")
.get(getUser)
.patch(updateUser)
.delete(deleteUser);

module.exports = router;