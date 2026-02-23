const express = require("express");
const router = express.Router();
const { createResource, updateResource, deleteResource, getResourceById, getResourcesList, uploadResume, uploadResumeForm } = require("../controllers/resource.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const rawBinary = express.raw({ type: "*/*", limit: "20mb" });
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get("/ping", (_req, res) => res.status(200).json({ success: true, message: "ok", data: {} }));
router.post("/", verifyToken, createResource);
router.post("/:id/resume", verifyToken, rawBinary, uploadResume);
router.post(
  "/:id/resume-form",
  verifyToken,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        const msg = err && err.message ? err.message : "Upload error";
        return res.status(400).json({ success: false, message: msg, data: {} });
      }
      next();
    });
  },
  uploadResumeForm
);
router.put("/:id", verifyToken, updateResource);
router.delete("/:id", verifyToken, deleteResource);
router.get("/:id", verifyToken, getResourceById);
router.get("/", verifyToken, getResourcesList);

module.exports = router;
