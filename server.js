require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Hello = require("./models/Hello");
const puppeteer = require("puppeteer");

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

/* DOWNLOAD PDF */
app.get("/api/hello/pdf", async (req, res) => {
  try {
    const data = await Hello.find().sort({ createdAt: -1 });

    // Build HTML table
    const rows = data
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${new Date(item.createdAt).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>Name Entry Report</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=hello-data.pdf"
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // IMPORTANT
    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF error:", error);
    res.status(500).json({ message: "PDF generation failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Accounting Portal Backend is running new updated credence 123");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
