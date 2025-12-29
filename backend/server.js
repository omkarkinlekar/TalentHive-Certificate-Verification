import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./controllers/authController.js";
import certRoutes from "./controllers/certController.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Static assets (PDFs, uploads, logos)
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/certs", express.static(path.join(__dirname, "public/certs")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/certs", certRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log("Server running on", PORT));
  })
  .catch((err) => console.error(err));
