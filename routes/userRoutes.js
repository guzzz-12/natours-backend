const express = require("express");
const {getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, uploadUserPhoto, resizeUserAvatar} = require("../controllers/userController");
const {signup, login, logout, forgotPassword, resetPassword, protectRoutes, restrictTo, updatePassword} = require("../controllers/authController");

const router = express.Router();

//Rutas que no requieren autenticación para acceder
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

//Rutas que requieren autenticación de usuario para acceder
router.get("/me", protectRoutes, getUser);
router.patch("/updateMe", protectRoutes, uploadUserPhoto, resizeUserAvatar, updateMe);
router.delete("/deleteMe", protectRoutes, deleteMe);
router.patch("/updatePassword", protectRoutes, updatePassword);

//Rutas que requieren autenticación de adminitrador para acceder
router.route("/")
.get(protectRoutes, restrictTo("admin"), getAllUsers)
.post(protectRoutes, restrictTo("admin"), createUser);

router.route("/:id")
.get(protectRoutes, restrictTo("admin"), getUser)
.patch(protectRoutes, restrictTo("admin"), updateUser)
.delete(protectRoutes, restrictTo("admin"), deleteUser);

module.exports = router;