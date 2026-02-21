const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const crypto = require("crypto");
const { isEmailValid, isPasswordStrong } = require("../middleware/validation");

async function isLogin(req, res) {
  try {
    const rawEmail = (req.body?.email ?? "").trim().toLowerCase();
    const rawPassword = (req.body?.password ?? "").trim();
    if (!rawEmail || !rawPassword || !isEmailValid(rawEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    // removed whitelist enforcement; RBAC is enforced via roles
    const user = await User.findOne({ where: { email: rawEmail } });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(rawPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }
    if (!user.status || (user.role !== "admin" && user.role !== "superadmin")) {
      console.log("LOGIN_BLOCK", { status: user.status, role: user.role });
      return res.status(403).json({ success: false, message: "Access denied (role)" });
    }
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "dev_secret";
    const exp = (process.env.JWT_EXPIRES_IN && /^\d+[smhd]$/.test(process.env.JWT_EXPIRES_IN)) ? process.env.JWT_EXPIRES_IN : "8h";
    const token = jwt.sign(
      { users_id: user.users_id, role: user.role },
      secret,
      { expiresIn: exp }
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        users_id: user.users_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
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
    const hashed = await bcrypt.hash(newPassword, 12);
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

async function createAdmin(req, res) {
  try {
    const name = (req.body?.name ?? "").trim();
    const email = (req.body?.email ?? "").trim().toLowerCase();
    const password = (req.body?.password ?? "").trim();
    if (!name || !isEmailValid(email) || !isPasswordStrong(password)) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }
    const exists = await User.findOne({ where: { email }, paranoid: false });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      status: true,
    });
    return res.status(201).json({
      success: true,
      message: "Admin created",
      data: { users_id: user.users_id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error" });
  }
}

async function deleteUser(req, res) {
  try {
    const targetId = Number(req.params?.users_id || 0);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }
    const requesterId = req.user?.users_id ?? req.admin?.users_id ?? null;
    if (requesterId === targetId) {
      return res.status(400).json({ success: false, message: "Cannot delete self" });
    }
    const target = await User.findByPk(targetId);
    if (!target || target.role !== "admin") {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    const deleted = await User.destroy({ where: { users_id: targetId } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    return res.status(200).json({ success: true, message: "Admin softly deleted" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error" });
  }
}

async function deleteUserByEmail(req, res) {
  try {
    const email = (req.body?.email ?? "").trim().toLowerCase();
    if (!isEmailValid(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const requesterEmail = (req.user?.email ?? req.admin?.email ?? "").toLowerCase();
    if (requesterEmail && requesterEmail === email) {
      return res.status(400).json({ success: false, message: "Cannot delete self" });
    }
    const target = await User.findOne({ where: { email } });
    if (!target || target.role !== "admin") {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    const deleted = await User.destroy({ where: { users_id: target.users_id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    return res.status(200).json({ success: true, message: "Admin softly deleted" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error" });
  }
}
async function getProfiles(req, res) {
  try {
    const role = req.user?.role ?? req.admin?.role ?? "";
    const id = req.user?.users_id ?? req.admin?.users_id ?? null;
    if (role === "superadmin") {
      const users = await User.findAll({
        attributes: ["users_id", "name", "email", "role", "status", "created_at", "updated_at"],
      });
      return res.status(200).json({ success: true, message: "Profiles fetched", data: users });
    }
    if (role === "admin" && id) {
      const me = await User.findByPk(id, {
        attributes: ["users_id", "name", "email", "role", "status", "created_at", "updated_at"],
      });
      if (!me) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
      return res.status(200).json({ success: true, message: "Profile fetched", data: [me] });
    }
    return res.status(403).json({ success: false, message: "Forbidden" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : "Server error" });
  }
}

module.exports = {
  isLogin,
  isLogout,
  getAdminProfile,
  forgotPassword,
  resetPassword,
  deleteMe,
  createAdmin,
  deleteUser,
  deleteUserByEmail,
  getProfiles,
};
