const allowed = (val) => Array.isArray(val) && val.every((r) => typeof r === "string" && r.length > 0);

function checkRole(allowedRoles) {
  const list = Array.isArray(allowedRoles) ? allowedRoles.map((r) => String(r).toLowerCase()) : [];
  return (req, res, next) => {
    if (!allowed(list)) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
    const role = (req.user?.role || req.admin?.role || "").toLowerCase();
    if (!role || !list.includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

module.exports = { checkRole };
