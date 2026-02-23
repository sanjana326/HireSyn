const express = require("express");
const router = express.Router();
const { createClient, updateClient, deleteClient, getClientById, getClientsList } = require("../controllers/client.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/ping", (_req, res) => res.status(200).json({ success: true, message: "ok", data: {} }));
router.post("/", verifyToken, createClient);
router.put("/:id", verifyToken, updateClient);
router.delete("/:id", verifyToken, deleteClient);
router.get("/:id", verifyToken, getClientById);
router.get("/", verifyToken, getClientsList);

module.exports = router;
