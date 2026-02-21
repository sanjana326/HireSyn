const express = require("express");
const router = express.Router();
const { createVendor, updateVendor, deleteVendor, getVendorById, getVendorsList } = require("../controllers/vendor.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/ping", (_req, res) => res.status(200).json({ success: true, message: "ok", data: {} }));
router.post("/", verifyToken, createVendor);
router.put("/:id", verifyToken, updateVendor);
router.delete("/:id", verifyToken, deleteVendor);
router.get("/:id", verifyToken, getVendorById);
router.get("/", verifyToken, getVendorsList);

module.exports = router;
