const path = require("path");
const fs = require("fs");
const { Resource, Vendor } = require("../models");
const { Op } = require("sequelize");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function pad(n) {
  return String(n).padStart(3, "0");
}

async function createResource(req, res) {
  try {
    const name = (req.body?.name ?? "").trim();
    const role = (req.body?.role ?? "").trim();
    const skills = typeof req.body?.skills === "string" ? req.body.skills.trim() : null;
    const experience = typeof req.body?.experience === "string" ? req.body.experience.trim() : null;
    const monthly_rate = typeof req.body?.monthly_rate !== "undefined" ? Number(req.body.monthly_rate) : null;
    const availability = typeof req.body?.availability === "string" ? req.body.availability.trim() : null;
    const job_type = typeof req.body?.job_type === "string" ? req.body.job_type.trim() : null;
    const vendor_id = Number(req.body?.vendor_id ?? 0);
    const resume_pdf_base64 = typeof req.body?.resume_pdf_base64 === "string" ? req.body.resume_pdf_base64 : null;
    if (!name || !role || !Number.isInteger(vendor_id) || vendor_id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input", data: {} });
    }
    if (monthly_rate !== null && (Number.isNaN(monthly_rate) || monthly_rate < 0)) {
      return res.status(400).json({ success: false, message: "Invalid monthly_rate", data: {} });
    }
    const vendor = await Vendor.findOne({ where: { vendor_id, is_deleted: false } });
    if (!vendor) {
      return res.status(400).json({ success: false, message: "Invalid vendor_id", data: {} });
    }
    const resource = await Resource.create({
      resource_code: `TEMP-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      name,
      role,
      skills,
      experience,
      monthly_rate,
      availability,
      job_type,
      vendor_id,
      resume_path: null,
      is_deleted: false,
    });
    const code = `ZV/R/${pad(resource.resource_id)}`;
    let resume_path = null;
    if (resume_pdf_base64) {
      let buf;
      try {
        buf = Buffer.from(resume_pdf_base64, "base64");
      } catch {
        return res.status(400).json({ success: false, message: "Invalid resume_pdf_base64", data: {} });
      }
      if (!buf || buf.length < 4 || buf.slice(0, 4).toString() !== "%PDF") {
        return res.status(400).json({ success: false, message: "Invalid resume_pdf_base64", data: {} });
      }
      const dir = path.join(__dirname, "..", "uploads", "resumes");
      ensureDir(dir);
      const safeCode = code.replace(/[\/\\]/g, "_");
      const file = path.join(dir, `${safeCode}.pdf`);
      fs.writeFileSync(file, buf);
      resume_path = file;
    }
    await resource.update({ resource_code: code, resume_path });
    return res.status(201).json({ success: true, message: "Resource created successfully", data: resource });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function updateResource(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid resource_id", data: {} });
    }
    const resource = await Resource.findOne({ where: { resource_id: id, is_deleted: false } });
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found", data: {} });
    }
    const payload = {};
    if (typeof req.body?.name === "string") payload.name = req.body.name.trim();
    if (typeof req.body?.role === "string") payload.role = req.body.role.trim();
    if (typeof req.body?.skills === "string") payload.skills = req.body.skills.trim();
    if (typeof req.body?.experience === "string") payload.experience = req.body.experience.trim();
    if (typeof req.body?.monthly_rate !== "undefined") {
      const mr = Number(req.body.monthly_rate);
      if (Number.isNaN(mr) || mr < 0) return res.status(400).json({ success: false, message: "Invalid monthly_rate", data: {} });
      payload.monthly_rate = mr;
    }
    if (typeof req.body?.availability === "string") payload.availability = req.body.availability.trim();
    if (typeof req.body?.job_type === "string") payload.job_type = req.body.job_type.trim();
    if (typeof req.body?.vendor_id !== "undefined") {
      const vid = Number(req.body.vendor_id);
      if (!Number.isInteger(vid) || vid <= 0) return res.status(400).json({ success: false, message: "Invalid vendor_id", data: {} });
      const v = await Vendor.findOne({ where: { vendor_id: vid, is_deleted: false } });
      if (!v) return res.status(400).json({ success: false, message: "Invalid vendor_id", data: {} });
      payload.vendor_id = vid;
    }
    const resume_pdf_base64 = typeof req.body?.resume_pdf_base64 === "string" ? req.body.resume_pdf_base64 : null;
    if (resume_pdf_base64) {
      let buf;
      try {
        buf = Buffer.from(resume_pdf_base64, "base64");
      } catch {
        return res.status(400).json({ success: false, message: "Invalid resume_pdf_base64", data: {} });
      }
      if (!buf || buf.length < 4 || buf.slice(0, 4).toString() !== "%PDF") {
        return res.status(400).json({ success: false, message: "Invalid resume_pdf_base64", data: {} });
      }
      const dir = path.join(__dirname, "..", "uploads", "resumes");
      ensureDir(dir);
      const safeCode = String(resource.resource_code).replace(/[\/\\]/g, "_");
      const file = path.join(dir, `${safeCode}.pdf`);
      fs.writeFileSync(file, buf);
      payload.resume_path = file;
    }
    await resource.update(payload);
    return res.status(200).json({ success: true, message: "Resource updated successfully", data: resource });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function deleteResource(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid resource_id", data: {} });
    }
    const resource = await Resource.findOne({ where: { resource_id: id } });
    if (!resource || resource.is_deleted) {
      return res.status(404).json({ success: false, message: "Resource not found", data: {} });
    }
    await Resource.update({ is_deleted: true }, { where: { resource_id: id } });
    return res.status(200).json({ success: true, message: "Resource deleted successfully", data: {} });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getResourceById(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid resource_id", data: {} });
    }
    const resource = await Resource.findOne({
      where: { resource_id: id, is_deleted: false },
      include: [{ model: Vendor, attributes: ["vendor_id", "organization_name", "representative_name", "email"] }],
    });
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found", data: {} });
    }
    return res.status(200).json({ success: true, message: "Resource fetched successfully", data: resource });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getResourcesList(req, res) {
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
      ops.push({ role: { [Op.like]: `%${search}%` } });
      ops.push({ skills: { [Op.like]: `%${search}%` } });
    }
    if (ops.length > 0) {
      where[Op.or] = ops;
    }
    const { count, rows } = await Resource.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [["resource_id", "DESC"]],
      attributes: ["resource_id", "resource_code", "name", "role", "skills", "experience", "monthly_rate", "availability", "job_type", "vendor_id", "resume_path", "created_at", "updated_at"],
    });
    const totalPages = Math.ceil(count / pageLimit) || 1;
    return res.status(200).json({
      success: true,
      message: "Resources fetched successfully",
      data: {
        total: count,
        currentPage,
        totalPages,
        resources: rows,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getResourcesByVendor(req, res) {
  try {
    const vendorId = Number(req.params?.id ?? 0);
    const page = Number(req.query?.page ?? 1);
    const limit = Number(req.query?.limit ?? 10);
    const search = typeof req.query?.search === "string" ? req.query.search.trim() : "";
    if (!Number.isInteger(vendorId) || vendorId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid vendor_id", data: {} });
    }
    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const pageLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const offset = (currentPage - 1) * pageLimit;
    const where = { is_deleted: false, vendor_id: vendorId };
    const ops = [];
    if (search) {
      ops.push({ name: { [Op.like]: `%${search}%` } });
      ops.push({ role: { [Op.like]: `%${search}%` } });
      ops.push({ skills: { [Op.like]: `%${search}%` } });
    }
    if (ops.length > 0) where[Op.or] = ops;
    const { count, rows } = await Resource.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [["resource_id", "DESC"]],
      attributes: ["resource_id", "resource_code", "name", "role", "skills", "experience", "monthly_rate", "availability", "job_type", "vendor_id", "resume_path", "created_at", "updated_at"],
    });
    const totalPages = Math.ceil(count / pageLimit) || 1;
    return res.status(200).json({
      success: true,
      message: "Vendor resources fetched successfully",
      data: { total: count, currentPage, totalPages, resources: rows },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}
async function uploadResume(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid resource_id", data: {} });
    }
    const ct = (req.headers["content-type"] || "").split(";")[0].toLowerCase();
    if (!(ct.startsWith("application/pdf") || ct.startsWith("application/octet-stream"))) {
      return res.status(400).json({ success: false, message: "Content-Type must be application/pdf or application/octet-stream", data: {} });
    }
    const buf = req.body;
    if (!Buffer.isBuffer(buf) || buf.length < 4 || buf.slice(0, 4).toString() !== "%PDF") {
      return res.status(400).json({ success: false, message: "Invalid PDF content", data: {} });
    }
    const resource = await Resource.findOne({ where: { resource_id: id, is_deleted: false } });
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found", data: {} });
    }
    const dir = path.join(__dirname, "..", "uploads", "resumes");
    ensureDir(dir);
    const safeCode = String(resource.resource_code).replace(/[\/\\]/g, "_");
    const file = path.join(dir, `${safeCode}.pdf`);
    fs.writeFileSync(file, buf);
    await resource.update({ resume_path: file });
    return res.status(200).json({ success: true, message: "Resume uploaded successfully", data: { resume_path: file } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function uploadResumeForm(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid resource_id", data: {} });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "Missing resume file", data: {} });
    }
    const buf = req.file.buffer;
    if (!Buffer.isBuffer(buf) || buf.length < 4 || buf.slice(0, 4).toString() !== "%PDF") {
      return res.status(400).json({ success: false, message: "Invalid PDF content", data: {} });
    }
    const resource = await Resource.findOne({ where: { resource_id: id, is_deleted: false } });
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found", data: {} });
    }
    const dir = path.join(__dirname, "..", "uploads", "resumes");
    ensureDir(dir);
    const safeCode = String(resource.resource_code).replace(/[\/\\]/g, "_");
    const file = path.join(dir, `${safeCode}.pdf`);
    fs.writeFileSync(file, buf);
    await resource.update({ resume_path: file });
    return res.status(200).json({ success: true, message: "Resume uploaded successfully", data: { resume_path: file } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

module.exports = { createResource, updateResource, deleteResource, getResourceById, getResourcesList, uploadResume, uploadResumeForm, getResourcesByVendor };
