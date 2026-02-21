const { Vendor, User } = require("../models");
const { Op } = require("sequelize");
const { isEmailValid } = require("../middleware/validation");

async function createVendor(req, res) {
  try {
    const representative_name = (req.body?.representative_name ?? "").trim();
    const organization_name = (req.body?.organization_name ?? "").trim();
    const contact = (req.body?.contact ?? "").trim();
    const email = (req.body?.email ?? "").trim().toLowerCase();
    const budget_type = (req.body?.budget_type ?? "").trim();
    const handled_by = Number(req.body?.handled_by ?? 0);
    if (!representative_name || !organization_name || !contact || !isEmailValid(email) || !budget_type || !Number.isInteger(handled_by) || handled_by <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input", data: {} });
    }
    if (!["Zero", "Both"].includes(budget_type)) {
      return res.status(400).json({ success: false, message: "Invalid budget_type", data: {} });
    }
    const handler = await User.findByPk(handled_by);
    if (!handler) {
      return res.status(400).json({ success: false, message: "Invalid handled_by", data: {} });
    }
    const vendor = await Vendor.create({
      representative_name,
      organization_name,
      contact,
      email,
      budget_type,
      status: true,
      handled_by,
      is_deleted: false,
    });
    return res.status(201).json({ success: true, message: "Vendor created successfully", data: vendor });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function updateVendor(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid vendor_id", data: {} });
    }
    const vendor = await Vendor.findOne({ where: { vendor_id: id, is_deleted: false } });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found", data: {} });
    }
    const payload = {};
    if (typeof req.body?.representative_name === "string") payload.representative_name = req.body.representative_name.trim();
    if (typeof req.body?.organization_name === "string") payload.organization_name = req.body.organization_name.trim();
    if (typeof req.body?.contact === "string") payload.contact = req.body.contact.trim();
    if (typeof req.body?.email === "string") {
      const e = req.body.email.trim().toLowerCase();
      if (!isEmailValid(e)) return res.status(400).json({ success: false, message: "Invalid email", data: {} });
      payload.email = e;
    }
    if (typeof req.body?.budget_type === "string") {
      const b = req.body.budget_type.trim();
      if (!["Zero", "Both"].includes(b)) return res.status(400).json({ success: false, message: "Invalid budget_type", data: {} });
      payload.budget_type = b;
    }
    if (typeof req.body?.status !== "undefined") payload.status = !!req.body.status;
    if (typeof req.body?.handled_by !== "undefined") {
      const hb = Number(req.body.handled_by);
      if (!Number.isInteger(hb) || hb <= 0) return res.status(400).json({ success: false, message: "Invalid handled_by", data: {} });
      const handler = await User.findByPk(hb);
      if (!handler) return res.status(400).json({ success: false, message: "Invalid handled_by", data: {} });
      payload.handled_by = hb;
    }
    await vendor.update(payload);
    return res.status(200).json({ success: true, message: "Vendor updated successfully", data: vendor });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function deleteVendor(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid vendor_id", data: {} });
    }
    const vendor = await Vendor.findOne({ where: { vendor_id: id } });
    if (!vendor || vendor.is_deleted) {
      return res.status(404).json({ success: false, message: "Vendor not found", data: {} });
    }
    await Vendor.update({ is_deleted: true }, { where: { vendor_id: id } });
    return res.status(200).json({ success: true, message: "Vendor deleted successfully", data: {} });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getVendorById(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid vendor_id", data: {} });
    }
    const vendor = await Vendor.findOne({
      where: { vendor_id: id, is_deleted: false },
      include: [{ model: User, attributes: ["users_id", "name", "email"] }],
    });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found", data: {} });
    }
    return res.status(200).json({ success: true, message: "Vendor fetched successfully", data: vendor });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getVendorsList(req, res) {
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
      ops.push({ representative_name: { [Op.like]: `%${search}%` } });
      ops.push({ organization_name: { [Op.like]: `%${search}%` } });
      ops.push({ email: { [Op.like]: `%${search}%` } });
      ops.push({ contact: { [Op.like]: `%${search}%` } });
    }
    if (ops.length > 0) {
      where[Op.or] = ops;
    }
    const { count, rows } = await Vendor.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [["vendor_id", "DESC"]],
      attributes: ["vendor_id", "representative_name", "organization_name", "contact", "email", "budget_type", "status", "handled_by", "created_at", "updated_at"],
    });
    const totalPages = Math.ceil(count / pageLimit) || 1;
    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: {
        total: count,
        currentPage,
        totalPages,
        vendors: rows,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

module.exports = { createVendor, updateVendor, deleteVendor, getVendorById, getVendorsList };
