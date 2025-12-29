import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFDocument from "pdfkit";
import Audit from "../models/Audit.js";
import { sendMail } from "../utils/mailer.js";
import { certificateEmailTemplate } from "../utils/emailTemplates.js";

import Certificate from "../models/Certificate.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// multer for uploads
const upload = multer({ dest: path.join(__dirname, "../uploads/") });

// Excel serial number → JS Date
function excelToJSDate(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  return new Date(excelEpoch.getTime() + serial * 86400000);
}

function convertDate(value) {
  if (!value) return null;

  // Already a Date object
  if (value instanceof Date) return value;

  if (typeof value === "number") {
    return excelToJSDate(value);
  }

  // Normal date
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;

  return null;
}

// 1) Upload excel and parse
router.post("/upload", authMiddleware, adminOnly, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    res.json({ rows, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5) Download certificate PDF
router.get("/download/:certificateId", async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId });
    if (!cert) return res.status(404).send("Certificate not found");

    const pdfFilePath = path.join(__dirname, "../public", cert.pdfPath.replace(/^\/+/, ""));
    if (!fs.existsSync(pdfFilePath)) return res.status(404).send("PDF not found");

    res.download(pdfFilePath, `${cert.certificateId}.pdf`);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).send("Error downloading certificate");
  }
});

// 2) Generate certificates
router.post("/generate", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { filename, mapping, customPrefix } = req.body;
    if (!filename || !mapping) return res.status(400).json({ message: "Missing filename/mapping" });

    const uploadPath = path.join(__dirname, "../uploads", filename);
    if (!fs.existsSync(uploadPath)) return res.status(400).json({ message: "Upload not found" });

    const workbook = xlsx.readFile(uploadPath);
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });

    const created = [];
    try{
      for (const row of rows) {
        const id = `${customPrefix || "TH"}-${uuidv4().split("-")[0].toUpperCase()}`;
        mapping.startDate = "start date";
        mapping.endDate = "end date";
        const data = {
          certificateId: id,
          studentName: row[mapping.studentName] || "",
          email: row[mapping.email] || "",
          courseName: row[mapping.courseName] || "",
          issueDate: new Date(),
          meta: {
            startDate: convertDate(row[mapping.startDate]),
            endDate: convertDate(row[mapping.endDate])
          },
        };

        // Generate PDF
        const pdfName = `${id}.pdf`;
        const certsDir = path.join(__dirname, "../public/certs");
        if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

        const pdfPath = path.join(certsDir, pdfName);
        await createCertificatePDF(data, pdfPath);

        const certDoc = await Certificate.create({
          ...data,
          pdfPath: `/certs/${pdfName}`,
          createdBy: req.user._id
        });

        created.push(certDoc);
        
        // Send Email (wrapped in try/catch)
        try {
          await sendMail({
            to: data.email,
            subject: "🎉 Your Certificate Is Ready – TalentHive",
            html: certificateEmailTemplate(data),
          });
        } catch (emailErr) {
          console.error("Email failed for", data.email, emailErr);
        }
        await Audit.create({
          admin: req.user.email,
          action: "Created Certificate",
          certId: id
        });
      }
      fs.unlink(uploadPath, () => {});
      res.json({ created, count: created.length });
    } catch (err) {
      console.error("GENERATION ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.find().sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

router.get("/audit-logs", authMiddleware, adminOnly, getAuditLogs);

router.get("/analytics", async (req, res) => {
  try {
    const certificates = await Certificate.find();

    // total certificates
    const total = certificates.length;

    // total unique students
    const totalStudents = new Set(certificates.map(c => c.studentName)).size;

    // domain stats
    const domainStats = {};
    certificates.forEach(c => {
      domainStats[c.courseName] = (domainStats[c.courseName] || 0) + 1;
    });

    // certificates per month (current year)
    const nowYear = new Date().getFullYear();
    const perMonth = Array(12).fill(0);

    certificates.forEach(c => {
      const date = new Date(c.issueDate);
      if (date.getFullYear() === nowYear) {
        perMonth[date.getMonth()]++;
      }
    });

    // certificates per year
    const perYear = {};
    certificates.forEach(c => {
      const y = new Date(c.issueDate).getFullYear();
      perYear[y] = (perYear[y] || 0) + 1;
    });

    // average duration (end - start)
    let durations = certificates.map(c => {
      if (!c.meta?.startDate || !c.meta?.endDate) return null;
      return (
        (new Date(c.meta.endDate) - new Date(c.meta.startDate)) /
        (1000 * 60 * 60 * 24)
      );
    }).filter(Boolean);

    const avgDuration = durations.length
      ? (durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    res.json({
      total,
      totalStudents,
      domainStats,
      perMonth,
      perYear,
      avgDuration,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics error" });
  }
});

// logged-in user's certificates
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const list = await Certificate.find({ email: req.user.email })
      .sort({ createdAt: -1 });

    res.json({ list });
  } catch (err) {
    console.error("User cert fetch error:", err);
    res.status(500).json({ message: "Error fetching certificates" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const results = await Certificate.find({
      certificateId: { $regex: q, $options: "i" }
    }).limit(10);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3) Verify certificate
router.get("/verify/:certificateId", async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId });
    if (!cert) return res.status(404).json({ valid: false, message: "Not found" });

    const fullUrl = `${req.protocol}://${req.get("host")}${cert.pdfPath}`;

    res.json({
      valid: true,
      certificate: {
        ...cert.toObject(),
        pdfPath: fullUrl   // << FIXED HERE
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4) List all certificates
router.get("/list", authMiddleware, adminOnly, async (req, res) => {
  const list = await Certificate.find().sort({ createdAt: -1 }).limit(500);
  res.json({ list });
});

router.put("/edit/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { studentName, email, courseName, startDate, endDate } = req.body;

    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    // update fields only if provided
    if (studentName) cert.studentName = studentName;
    if (email) cert.email = email;
    if (courseName) cert.courseName = courseName;

    // update dates
    if (startDate) cert.meta.startDate = convertDate(startDate);
    if (endDate) cert.meta.endDate = convertDate(endDate);

    // DELETE old pdf
    const oldPdfPath = path.join(__dirname, "../public", cert.pdfPath.replace(/^\/+/, ""));
    if (fs.existsSync(oldPdfPath)) fs.unlinkSync(oldPdfPath);

    // GENERATE NEW PDF
    const newPdfName = `${cert.certificateId}.pdf`;
    const certsDir = path.join(__dirname, "../public/certs");

    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

    const newPdfPath = path.join(certsDir, newPdfName);

    await createCertificatePDF(cert, newPdfPath);

    // update PDF path in DB
    cert.pdfPath = `/certs/${newPdfName}`;

    await cert.save();

    res.json({
      message: "Certificate updated + PDF regenerated",
      certificate: cert,
    });

    await Audit.create({
      admin: req.user.email,
      action: "Updated Certificate",
      certId: req.params.id
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating certificate" });
  }
});

// DELETE certificate
router.delete("/delete/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    // remove PDF file if exists
    const pdfFilePath = path.join(__dirname, "../public", cert.pdfPath.replace(/^\/+/, ""));
    if (fs.existsSync(pdfFilePath)) fs.unlinkSync(pdfFilePath);

    await Certificate.findByIdAndDelete(req.params.id);

    res.json({ message: "Certificate deleted successfully" });

    await Audit.create({
      admin: req.user.email,
      action: "Deleted Certificate",
      certId: req.params.id
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting certificate" });
  }
});

function formatJSDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toISOString().substring(0, 10); // → "2025-06-13"
}

// PDF Generator (UPDATED WITH DATE FIX)
async function createCertificatePDF(data, outPath) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    const darkBlue = "#004080";
    const gold = "#d4af37";
    const centerX = doc.page.width / 2;

    // Borders
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(8).strokeColor(darkBlue).stroke();

    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(1.5).strokeColor(gold).stroke();

    // QR Code + Logo
    try {
      const QRCode = await import("qrcode");
      const qrData = await QRCode.toDataURL(
        `http://localhost:3000/verify/${data.certificateId}`
      );
      doc.image(qrData, doc.page.width - 120, 40, { width: 60 });
    } catch (err) {
      console.error("QR Error:", err);
    }

    // Logo
    try {
      const logoPath = path.resolve("public/logo.png");
      if (fs.existsSync(logoPath))
        doc.image(logoPath, centerX - 35, 45, { width: 70 });
    } catch {}

    doc.moveDown(3);
    doc.font("Times-Bold").fontSize(28).fillColor(darkBlue).text("CERTIFICATE", { align: "center" });
    doc.font("Times-Bold").fontSize(18).fillColor(gold).text("OF INTERNSHIP", { align: "center" });

    doc.moveDown(1.5);
    doc.font("Helvetica").fontSize(12).fillColor("#333")
      .text("This internship program is presented to", { align: "center" });

    doc.moveDown(0.8);
    doc.font("Helvetica-BoldOblique").fontSize(34).fillColor(gold)
      .text(data.studentName || "Student Name", { align: "center" });

    const message = `We want to show utmost respect for the service and valuable contributions you’ve rendered during your internship in the domain of ${data.courseName || "—"}.`;
    doc.moveDown(1);
    doc.font("Helvetica").fontSize(12).fillColor("#444")
      .text(message, { align: "center", lineGap: 6, indent: 20 });

    doc.moveDown(2);

    const startDate = formatJSDate(data.meta?.startDate);
    const endDate = formatJSDate(data.meta?.endDate);

    doc.font("Helvetica").fontSize(12).fillColor("#555")
      .text(`Duration: ${startDate} to ${endDate}`, { align: "center" });

    doc.moveDown(3);

    // Seal
    try {
      const sealPath = path.resolve("public/seal.png");
      if (fs.existsSync(sealPath)) {
        doc.image(sealPath, centerX - 40, doc.y, { width: 80 });
        doc.moveDown(3);
      }
    } catch {}

    // Signatures
    const baseY = doc.page.height - 160;

    doc.moveTo(120, baseY).lineTo(220, baseY).strokeColor("#333").stroke();
    doc.font("Helvetica").fontSize(10).text("CEO", 120, baseY + 20, { width: 100, align: "center" });

    doc.moveTo(360, baseY).lineTo(500, baseY).strokeColor("#333").stroke();
    doc.font("Helvetica").fontSize(10).text("Program Manager", 340, baseY + 20, { width: 160, align: "center" });

    doc.font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#004080")
      .text(
        `Certificate ID: ${data.certificateId}`,
        doc.page.width - 230, // safe X inside margin
        doc.page.height - 80, // Y position
        { width: 150, align: "right" }
      );

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

export default router;
