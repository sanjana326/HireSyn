const express = require("express");
const router = express.Router();
const { isLogin, isLogout, getAdminProfile, forgotPassword, resetPassword, deleteMe } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/login", isLogin);
router.post("/logout", verifyToken, isLogout);
router.get("/profile", verifyToken, getAdminProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/me", verifyToken, deleteMe);

module.exports = router;
