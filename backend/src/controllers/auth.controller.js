const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const crypto = require("crypto");
const { isEmailValid, isPasswordStrong } = require("../middleware/validation");

async function isLogin(req, res) {
  try {
    const rawEmail = (req.body?.email ?? "").trim().toLowerCase();
    const rawPassword = (req.body?.password ?? "").trim();
    if (!rawEmail || !rawPassword) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const list =
      (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);
    const single = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const whitelist = list.length > 0 ? list : (single ? [single] : []);
    if (whitelist.length > 0 && !whitelist.includes(rawEmail)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const admin = await User.findOne({ where: { email: rawEmail } });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(rawPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }
    if (!admin.status || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "dev_secret";
    const exp = (process.env.JWT_EXPIRES_IN && /^\d+[smhd]$/.test(process.env.JWT_EXPIRES_IN)) ? process.env.JWT_EXPIRES_IN : "8h";
    const token = jwt.sign(
      { users_id: admin.users_id, role: admin.role },
      secret,
      { expiresIn: exp }
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        users_id: admin.users_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error" });
  }
}

async function isLogout(_req, res) {
  return res.status(200).json({ success: true, message: "Logout successful" });
}

async function getAdminProfile(req, res) {
  try {
    const id = req.admin?.users_id ?? req.admin?.id ?? null;
    if (!id) {
      return res.status(401).json({ success: false, message: "Access denied" });
    }
    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Access denied" });
    }
    return res.status(200).json({
      success: true,
      message: "Profile fetched",
      data: {
        users_id: admin.users_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (_) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { isLogin, isLogout, getAdminProfile };

async function forgotPassword(req, res) {
  try {
    const email = (req.body?.email ?? "").trim().toLowerCase();
    if (!isEmailValid(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const list =
      (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);
    const single = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const whitelist = list.length > 0 ? list : (single ? [single] : []);
    if (whitelist.length > 0 && !whitelist.includes(email)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const admin = await User.findOne({ where: { email } });
    if (!admin || admin.role !== "admin" || !admin.status) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await admin.update({
      reset_token: token,
      reset_token_expiry: expiry,
    });
    const resetLink = `http://localhost:${process.env.PORT || 5000}/reset-password?token=${token}`;
    return res.status(200).json({
      success: true,
      message: "Reset link generated",
      data: { resetLink, token },
    });
  } catch (_) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function resetPassword(req, res) {
  try {
    const token = (req.body?.token ?? "").trim();
    const newPassword = (req.body?.newPassword ?? "").trim();
    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }
    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({ success: false, message: "Weak password" });
    }
    const admin = await User.findOne({ where: { reset_token: token } });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    if (!admin.reset_token_expiry || new Date(admin.reset_token_expiry).getTime() < Date.now()) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await admin.update({
      password: hashed,
      reset_token: null,
      reset_token_expiry: null,
    });
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (_) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { isLogin, isLogout, getAdminProfile, forgotPassword, resetPassword };

async function deleteMe(req, res) {
  try {
    const id = req.admin?.users_id ?? req.admin?.id ?? null;
    if (!id) {
      return res.status(401).json({ success: false, message: "Access denied" });
    }
    const deleted = await User.destroy({ where: { users_id: id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    return res.status(200).json({ success: true, message: "Admin softly deleted" });
  } catch (_) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { isLogin, isLogout, getAdminProfile, forgotPassword, resetPassword, deleteMe };
