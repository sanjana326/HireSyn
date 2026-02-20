const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth.routes");

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

app.get("/", (req, res) => {
  res.send("C2C Backend Running...");
});

app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).json({ success: false, message: "Server error" });
});

module.exports = app;
