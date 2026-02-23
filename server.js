const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const companyRoutes = require("./routes/clientRoutes");
app.use("/api/companies", companyRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
