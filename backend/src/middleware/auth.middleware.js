const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  const altHeader = req.headers["x-access-token"];
  const queryToken = typeof req.query?.token === "string" ? req.query.token : null;
  let token = null;
  if (header && header.trim()) {
    const trimmed = header.trim();
    token = trimmed.toLowerCase().startsWith("bearer ")
      ? trimmed.slice(7).trim()
      : trimmed;
  } else if (altHeader && String(altHeader).trim()) {
    token = String(altHeader).trim();
  } else if (queryToken && queryToken.trim()) {
    token = queryToken.trim();
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (_) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

module.exports = { verifyToken };
