const express = require("express");
const router = express.Router();
const { isLogin, isLogout, getAdminProfile, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/login", isLogin);
router.post("/logout", verifyToken, isLogout);
router.get("/profile", verifyToken, getAdminProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
