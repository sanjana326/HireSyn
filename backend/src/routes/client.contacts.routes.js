const express = require("express");
const router = express.Router({ mergeParams: true });
const { createContacts, updateContact, deleteContact, getContactById, getContactsList } = require("../controllers/clientContact.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/ping", (_req, res) => res.status(200).json({ success: true, message: "ok", data: {} }));
router.post("/", verifyToken, createContacts);
router.put("/:id", verifyToken, updateContact);
router.delete("/:id", verifyToken, deleteContact);
router.get("/:id", verifyToken, getContactById);
router.get("/", verifyToken, getContactsList);

module.exports = router;
