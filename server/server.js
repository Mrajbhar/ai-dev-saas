require("dotenv").config();
const express = require("express");
const cors = require("cors");

const aiRoutes = require("./routes/ai");
const githubRoutes = require("./routes/github");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);
app.use("/api/github", githubRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});