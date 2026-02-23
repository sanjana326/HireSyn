const express = require("express");
const router = express.Router({ mergeParams: true });
const { getJobsByClient } = require("../controllers/job.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/ping", (_req, res) => res.status(200).json({ success: true, message: "ok", data: {} }));
router.get("/", verifyToken, getJobsByClient);

module.exports = router;
