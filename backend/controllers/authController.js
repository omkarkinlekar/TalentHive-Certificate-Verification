import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import { forgotPasswordEmailTemplate } from "../utils/emailTemplates.js";

const router = express.Router();

const ALLOWED_ADMINS = [
  "omkar@talenthive.com",
  "karishma@talenthive.com",
];

/* -------------------------- SIGNUP -------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const role = ALLOWED_ADMINS.includes(email) ? "admin" : "user";

    user = await User.create({ name, email, password, role });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ""
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------- LOGIN -------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ""
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------------------------
   AVATAR UPLOAD (Multer)
------------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "public/avatars";
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ---------------------- UPLOAD AVATAR ----------------------- */
router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      // Delete old avatar if exists
      if (user.avatar) {
        const oldFile = "public/avatars/" + user.avatar;
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      user.avatar = req.file.filename;
      await user.save();

      res.json({
        success: true,
        url: `http://localhost:5000/public/avatars/${req.file.filename}`
      });
    } catch (err) {
      res.status(500).json({ message: "Avatar upload failed" });
    }
  }
);

/* ---------------------- REMOVE AVATAR ----------------------- */
router.post("/remove-avatar", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.avatar) {
      const filePath = "public/avatars/" + user.avatar;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    user.avatar = "";
    await user.save();

    res.json({ success: true, message: "Avatar removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove avatar" });
  }
});

/* ----------------------- UPDATE USER ------------------------ */
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, avatar },
      { new: true }
    );

    res.json({ user: updated });
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

/* -------------------- CHANGE PASSWORD ----------------------- */
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const ok = await user.comparePassword(oldPassword);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating password" });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true }
  ).select("-password");

  res.json({ message: "Profile updated", user });
});

router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    const user = await User.findById(req.user._id);
    // remove old avatar if exists ...
  }
);

router.delete("/avatar", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  // remove file if exists... then:
  user.avatar = "";
  await user.save();
  res.json({ message: "Avatar removed" });
});

router.put("/password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const match = await user.comparePassword(oldPassword);

  if (!match) return res.status(400).json({ message: "Incorrect old password" });

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated" });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "Email not found" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Reset Your Password",
    html: forgotPasswordEmailTemplate({
      userName: user.name || "User",
      resetLink
    })
  });

  res.json({ msg: "Password reset link sent to your email" });
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ msg: "Invalid or expired token" });
  }
});


export default router;
