const { Client, User } = require("../models");
const { Op } = require("sequelize");
const { isEmailValid } = require("../middleware/validation");

async function createClient(req, res) {
  try {
    const name = (req.body?.name ?? "").trim();
    const organization_name = (req.body?.organization_name ?? "").trim();
    const contact = (req.body?.contact ?? "").trim();
    const email = (req.body?.email ?? "").trim().toLowerCase();
    const handled_by = Number(req.body?.handled_by ?? 0);
    const gst_number = typeof req.body?.gst_number === "string" ? req.body.gst_number.trim() : null;
    const website = typeof req.body?.website === "string" ? req.body.website.trim() : null;
    if (!name || !organization_name || !contact || !isEmailValid(email) || !Number.isInteger(handled_by) || handled_by <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input", data: {} });
    }
    const handler = await User.findByPk(handled_by);
    if (!handler) {
      return res.status(400).json({ success: false, message: "Invalid handled_by", data: {} });
    }
    const client = await Client.create({
      name,
      organization_name,
      contact,
      email,
      gst_number,
      website,
      status: true,
      handled_by,
      is_deleted: false,
    });
    return res.status(201).json({ success: true, message: "Client created successfully", data: client });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function updateClient(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
    }
    const client = await Client.findOne({ where: { client_id: id, is_deleted: false } });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found", data: {} });
    }
    const payload = {};
    if (typeof req.body?.name === "string") payload.name = req.body.name.trim();
    if (typeof req.body?.organization_name === "string") payload.organization_name = req.body.organization_name.trim();
    if (typeof req.body?.contact === "string") payload.contact = req.body.contact.trim();
    if (typeof req.body?.email === "string") {
      const e = req.body.email.trim().toLowerCase();
      if (!isEmailValid(e)) return res.status(400).json({ success: false, message: "Invalid email", data: {} });
      payload.email = e;
    }
    if (typeof req.body?.status !== "undefined") payload.status = !!req.body.status;
    if (typeof req.body?.gst_number === "string") payload.gst_number = req.body.gst_number.trim();
    if (typeof req.body?.website === "string") payload.website = req.body.website.trim();
    if (typeof req.body?.handled_by !== "undefined") {
      const hb = Number(req.body.handled_by);
      if (!Number.isInteger(hb) || hb <= 0) return res.status(400).json({ success: false, message: "Invalid handled_by", data: {} });
      const handler = await User.findByPk(hb);
      if (!handler) return res.status(400).json({ success: false, message: "Invalid handled_by", data: {} });
      payload.handled_by = hb;
    }
    await client.update(payload);
    return res.status(200).json({ success: true, message: "Client updated successfully", data: client });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function deleteClient(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
    }
    const client = await Client.findOne({ where: { client_id: id } });
    if (!client || client.is_deleted) {
      return res.status(404).json({ success: false, message: "Client not found", data: {} });
    }
    await Client.update({ is_deleted: true }, { where: { client_id: id } });
    return res.status(200).json({ success: true, message: "Client deleted successfully", data: {} });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getClientById(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
    }
    const client = await Client.findOne({
      where: { client_id: id, is_deleted: false },
      include: [{ model: User, attributes: ["users_id", "name", "email"] }],
    });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found", data: {} });
    }
    return res.status(200).json({ success: true, message: "Client fetched successfully", data: client });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getClientsList(req, res) {
  try {
    const page = Number(req.query?.page ?? 1);
    const limit = Number(req.query?.limit ?? 10);
    const search = typeof req.query?.search === "string" ? req.query.search.trim() : "";
    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const pageLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const offset = (currentPage - 1) * pageLimit;
    const where = { is_deleted: false };
    const ops = [];
    if (search) {
      ops.push({ name: { [Op.like]: `%${search}%` } });
      ops.push({ organization_name: { [Op.like]: `%${search}%` } });
      ops.push({ email: { [Op.like]: `%${search}%` } });
      ops.push({ contact: { [Op.like]: `%${search}%` } });
      ops.push({ website: { [Op.like]: `%${search}%` } });
      ops.push({ gst_number: { [Op.like]: `%${search}%` } });
    }
    if (ops.length > 0) {
      where[Op.or] = ops;
    }
    const { count, rows } = await Client.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [["client_id", "DESC"]],
      attributes: ["client_id", "name", "organization_name", "contact", "email", "gst_number", "website", "status", "handled_by", "created_at", "updated_at"],
    });
    const totalPages = Math.ceil(count / pageLimit) || 1;
    return res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      data: {
        total: count,
        currentPage,
        totalPages,
        clients: rows,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

module.exports = { createClient, updateClient, deleteClient, getClientById, getClientsList };
