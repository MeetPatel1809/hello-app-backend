require("dotenv").config(); // MUST be on top

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Hello = require("./models/Hello");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/hello", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });

  const entry = await Hello.create({ name });
  res.json(entry);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
