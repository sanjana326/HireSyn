const express = require("express");
const router = express.Router();
const { createJob, updateJob, deleteJob, getJobById, getJobsList } = require("../controllers/job.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/ping", (_req, res) => res.status(200).json({ success: true, message: "ok", data: {} }));
router.post("/", verifyToken, createJob);
router.put("/:id", verifyToken, updateJob);
router.delete("/:id", verifyToken, deleteJob);
router.get("/:id", verifyToken, getJobById);
router.get("/", verifyToken, getJobsList);

module.exports = router;
