const { ClientContact, Client } = require("../models");
const { Op } = require("sequelize");
const { isEmailValid } = require("../middleware/validation");

async function createContacts(req, res) {
  try {
    const clientId = Number(req.params?.clientId ?? 0);
    if (!Number.isInteger(clientId) || clientId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
    }
    const client = await Client.findOne({ where: { client_id: clientId, is_deleted: false } });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found", data: {} });
    }
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const toCreate = [];
    for (const item of payload) {
      const name = (item?.name ?? "").trim();
      const position = (item?.position ?? "").trim();
      const phone = typeof item?.phone === "string" ? item.phone.trim() : null;
      const email = typeof item?.email === "string" ? item.email.trim().toLowerCase() : null;
      if (!name || !position) {
        return res.status(400).json({ success: false, message: "Invalid input", data: {} });
      }
      if (email && !isEmailValid(email)) {
        return res.status(400).json({ success: false, message: "Invalid email", data: {} });
      }
      toCreate.push({ client_id: clientId, name, position, phone, email, is_deleted: false });
    }
    const created = await ClientContact.bulkCreate(toCreate);
    return res.status(201).json({ success: true, message: "Contacts created successfully", data: created });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function updateContact(req, res) {
  try {
    const clientId = Number(req.params?.clientId ?? 0);
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(clientId) || clientId <= 0 || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid id", data: {} });
    }
    const contact = await ClientContact.findOne({ where: { contact_id: id, client_id: clientId, is_deleted: false } });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found", data: {} });
    }
    const payload = {};
    if (typeof req.body?.name === "string") payload.name = req.body.name.trim();
    if (typeof req.body?.position === "string") payload.position = req.body.position.trim();
    if (typeof req.body?.phone === "string") payload.phone = req.body.phone.trim();
    if (typeof req.body?.email === "string") {
      const e = req.body.email.trim().toLowerCase();
      if (!isEmailValid(e)) return res.status(400).json({ success: false, message: "Invalid email", data: {} });
      payload.email = e;
    }
    await contact.update(payload);
    return res.status(200).json({ success: true, message: "Contact updated successfully", data: contact });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function deleteContact(req, res) {
  try {
    const clientId = Number(req.params?.clientId ?? 0);
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(clientId) || clientId <= 0 || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid id", data: {} });
    }
    const contact = await ClientContact.findOne({ where: { contact_id: id, client_id: clientId } });
    if (!contact || contact.is_deleted) {
      return res.status(404).json({ success: false, message: "Contact not found", data: {} });
    }
    await ClientContact.update({ is_deleted: true }, { where: { contact_id: id, client_id: clientId } });
    return res.status(200).json({ success: true, message: "Contact deleted successfully", data: {} });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getContactById(req, res) {
  try {
    const clientId = Number(req.params?.clientId ?? 0);
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(clientId) || clientId <= 0 || !Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid id", data: {} });
    }
    const contact = await ClientContact.findOne({ where: { contact_id: id, client_id: clientId, is_deleted: false } });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found", data: {} });
    }
    return res.status(200).json({ success: true, message: "Contact fetched successfully", data: contact });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getContactsList(req, res) {
  try {
    const clientId = Number(req.params?.clientId ?? 0);
    if (!Number.isInteger(clientId) || clientId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
    }
    const page = Number(req.query?.page ?? 1);
    const limit = Number(req.query?.limit ?? 10);
    const search = typeof req.query?.search === "string" ? req.query.search.trim() : "";
    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const pageLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const offset = (currentPage - 1) * pageLimit;
    const where = { is_deleted: false, client_id: clientId };
    const ops = [];
    if (search) {
      ops.push({ name: { [Op.like]: `%${search}%` } });
      ops.push({ position: { [Op.like]: `%${search}%` } });
      ops.push({ email: { [Op.like]: `%${search}%` } });
      ops.push({ phone: { [Op.like]: `%${search}%` } });
    }
    if (ops.length > 0) {
      where[Op.or] = ops;
    }
    const { count, rows } = await ClientContact.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [["contact_id", "DESC"]],
      attributes: ["contact_id", "client_id", "name", "position", "phone", "email", "created_at", "updated_at"],
    });
    const totalPages = Math.ceil(count / pageLimit) || 1;
    return res.status(200).json({
      success: true,
      message: "Contacts fetched successfully",
      data: {
        total: count,
        currentPage,
        totalPages,
        contacts: rows,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

module.exports = { createContacts, updateContact, deleteContact, getContactById, getContactsList };
