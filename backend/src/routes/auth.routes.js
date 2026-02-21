const express = require("express");
const router = express.Router();
const {
  isLogin,
  isLogout,
  getAdminProfile,
  forgotPassword,
  resetPassword,
  deleteMe,
  createAdmin,
  deleteUser,
  deleteUserByEmail,
  getProfiles,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");

router.post("/login", isLogin);
router.post("/logout", verifyToken, isLogout);
router.get("/profile", verifyToken, getAdminProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/me", verifyToken, deleteMe);

router.post("/create-admin", verifyToken, checkRole(["superadmin"]), createAdmin);
router.delete("/delete-user/:users_id", verifyToken, checkRole(["superadmin"]), deleteUser);
router.delete("/delete-user-by-email", verifyToken, checkRole(["superadmin"]), deleteUserByEmail);
router.get("/profiles", verifyToken, checkRole(["superadmin", "admin"]), getProfiles);

module.exports = router;
