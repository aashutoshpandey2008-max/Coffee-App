const dns = require("node:dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const coffeeRoutes = require("./routes/coffeeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Main test route
app.get("/", (req, res) => {
  res.json({
    message: "Coffee Rating API is running ☕",
  });
});

// Coffee API
app.use("/api/coffees", coffeeRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });