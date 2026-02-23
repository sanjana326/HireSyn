const { Job, Client } = require("../models");
const { Op } = require("sequelize");

async function createJob(req, res) {
  try {
    const job_title = (req.body?.job_title ?? "").trim();
    const client_id = Number(req.body?.client_id ?? 0);
    const skills = typeof req.body?.skills === "string" ? req.body.skills.trim() : null;
    const description = typeof req.body?.description === "string" ? req.body.description.trim() : null;
    const job_type = typeof req.body?.job_type === "string" ? req.body.job_type.trim() : null;
    const openings = Number(req.body?.openings ?? 1);
    const location = typeof req.body?.location === "string" ? req.body.location.trim() : null;
    const exp_range = typeof req.body?.exp_range === "string" ? req.body.exp_range.trim() : null;
    const budget_type = typeof req.body?.budget_type === "string" ? req.body.budget_type.trim() : null;
    const engagement_type = typeof req.body?.engagement_type === "string" ? req.body.engagement_type.trim() : null;
    const requirement_source = typeof req.body?.requirement_source === "string" ? req.body.requirement_source.trim() : null;
    const received_date = req.body?.received_date ? new Date(req.body.received_date) : null;
    const deadline = req.body?.deadline ? new Date(req.body.deadline) : null;
    if (!job_title || !Number.isInteger(client_id) || client_id <= 0 || !Number.isInteger(openings) || openings <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input", data: {} });
    }
    if (budget_type && !["Zero", "Both"].includes(budget_type)) {
      return res.status(400).json({ success: false, message: "Invalid budget_type", data: {} });
    }
    const client = await Client.findOne({ where: { client_id, is_deleted: false } });
    if (!client) {
      return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
    }
    const job = await Job.create({
      job_title,
      client_id,
      skills,
      description,
      job_type,
      openings,
      location,
      exp_range,
      budget_type,
      engagement_type,
      requirement_source,
      received_date,
      deadline,
      is_deleted: false,
    });
    return res.status(201).json({ success: true, message: "Job created successfully", data: job });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function updateJob(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid job_id", data: {} });
    }
    const job = await Job.findOne({ where: { job_id: id, is_deleted: false } });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found", data: {} });
    }
    const payload = {};
    if (typeof req.body?.job_title === "string") payload.job_title = req.body.job_title.trim();
    if (typeof req.body?.client_id !== "undefined") {
      const cid = Number(req.body.client_id);
      if (!Number.isInteger(cid) || cid <= 0) return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
      const c = await Client.findOne({ where: { client_id: cid, is_deleted: false } });
      if (!c) return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
      payload.client_id = cid;
    }
    if (typeof req.body?.skills === "string") payload.skills = req.body.skills.trim();
    if (typeof req.body?.description === "string") payload.description = req.body.description.trim();
    if (typeof req.body?.job_type === "string") payload.job_type = req.body.job_type.trim();
    if (typeof req.body?.openings !== "undefined") {
      const op = Number(req.body.openings);
      if (!Number.isInteger(op) || op <= 0) return res.status(400).json({ success: false, message: "Invalid openings", data: {} });
      payload.openings = op;
    }
    if (typeof req.body?.location === "string") payload.location = req.body.location.trim();
    if (typeof req.body?.exp_range === "string") payload.exp_range = req.body.exp_range.trim();
    if (typeof req.body?.budget_type === "string") {
      const b = req.body.budget_type.trim();
      if (!["Zero", "Both"].includes(b)) return res.status(400).json({ success: false, message: "Invalid budget_type", data: {} });
      payload.budget_type = b;
    }
    if (typeof req.body?.engagement_type === "string") payload.engagement_type = req.body.engagement_type.trim();
    if (typeof req.body?.requirement_source === "string") payload.requirement_source = req.body.requirement_source.trim();
    if (typeof req.body?.received_date !== "undefined") payload.received_date = req.body.received_date ? new Date(req.body.received_date) : null;
    if (typeof req.body?.deadline !== "undefined") payload.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
    await job.update(payload);
    return res.status(200).json({ success: true, message: "Job updated successfully", data: job });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function deleteJob(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid job_id", data: {} });
    }
    const job = await Job.findOne({ where: { job_id: id } });
    if (!job || job.is_deleted) {
      return res.status(404).json({ success: false, message: "Job not found", data: {} });
    }
    await Job.update({ is_deleted: true }, { where: { job_id: id } });
    return res.status(200).json({ success: true, message: "Job deleted successfully", data: {} });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getJobById(req, res) {
  try {
    const id = Number(req.params?.id ?? 0);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid job_id", data: {} });
    }
    const job = await Job.findOne({
      where: { job_id: id, is_deleted: false },
      include: [{ model: Client, attributes: ["client_id", "name", "organization_name"] }],
    });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found", data: {} });
    }
    return res.status(200).json({ success: true, message: "Job fetched successfully", data: job });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getJobsList(req, res) {
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
      ops.push({ job_title: { [Op.like]: `%${search}%` } });
      ops.push({ skills: { [Op.like]: `%${search}%` } });
      ops.push({ description: { [Op.like]: `%${search}%` } });
      ops.push({ location: { [Op.like]: `%${search}%` } });
      ops.push({ engagement_type: { [Op.like]: `%${search}%` } });
      ops.push({ requirement_source: { [Op.like]: `%${search}%` } });
    }
    if (ops.length > 0) {
      where[Op.or] = ops;
    }
    const { count, rows } = await Job.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [["job_id", "DESC"]],
      attributes: ["job_id", "job_title", "client_id", "skills", "job_type", "openings", "location", "exp_range", "budget_type", "engagement_type", "requirement_source", "received_date", "deadline", "created_at", "updated_at"],
    });
    const totalPages = Math.ceil(count / pageLimit) || 1;
    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: {
        total: count,
        currentPage,
        totalPages,
        jobs: rows,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

async function getJobsByClient(req, res) {
  try {
    const clientId = Number(req.params?.clientId ?? 0);
    const page = Number(req.query?.page ?? 1);
    const limit = Number(req.query?.limit ?? 10);
    const search = typeof req.query?.search === "string" ? req.query.search.trim() : "";
    if (!Number.isInteger(clientId) || clientId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid client_id", data: {} });
    }
    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    const pageLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const offset = (currentPage - 1) * pageLimit;
    const where = { is_deleted: false, client_id: clientId };
    const ops = [];
    if (search) {
      ops.push({ job_title: { [Op.like]: `%${search}%` } });
      ops.push({ skills: { [Op.like]: `%${search}%` } });
      ops.push({ description: { [Op.like]: `%${search}%` } });
      ops.push({ location: { [Op.like]: `%${search}%` } });
      ops.push({ engagement_type: { [Op.like]: `%${search}%` } });
      ops.push({ requirement_source: { [Op.like]: `%${search}%` } });
    }
    if (ops.length > 0) {
      where[Op.or] = ops;
    }
    const { count, rows } = await Job.findAndCountAll({
      where,
      offset,
      limit: pageLimit,
      order: [["job_id", "DESC"]],
      attributes: ["job_id", "job_title", "client_id", "skills", "job_type", "openings", "location", "exp_range", "budget_type", "engagement_type", "requirement_source", "received_date", "deadline", "created_at", "updated_at"],
    });
    const totalPages = Math.ceil(count / pageLimit) || 1;
    return res.status(200).json({
      success: true,
      message: "Client jobs fetched successfully",
      data: {
        total: count,
        currentPage,
        totalPages,
        jobs: rows,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error", data: {} });
  }
}

module.exports = { createJob, updateJob, deleteJob, getJobById, getJobsList, getJobsByClient };
