require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Hello = require("./models/Hello");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

/* SAVE NAME */
app.post("/api/hello", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    const entry = await Hello.create({ name });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* GET ALL NAMES (LATEST FIRST) */
app.get("/api/hello", async (req, res) => {
  try {
    const data = await Hello.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
