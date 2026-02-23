const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const clientRoutes = require("./routes/client.routes");
const clientContactsRoutes = require("./routes/client.contacts.routes");
const clientJobsRoutes = require("./routes/client.jobs.routes");
const jobRoutes = require("./routes/job.routes");
const resourceRoutes = require("./routes/resource.routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10kb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("C2C Backend Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/clients/:clientId/contacts", clientContactsRoutes);
app.use("/api/clients/:clientId/jobs", clientJobsRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resources", resourceRoutes);

app.get("/api/vendors/ping-direct", (_req, res) => {
  res.status(200).json({ success: true, message: "ok-direct" });
});

app.get("/debug", (_req, res) => {
  res.json({ hasVendorRoutes: typeof vendorRoutes, hasClientRoutes: typeof clientRoutes });
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ success: false, message: "Server error" });
});

module.exports = app;
