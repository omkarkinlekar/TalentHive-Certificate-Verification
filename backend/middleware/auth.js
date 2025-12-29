import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header)
      return res.status(401).json({ message: "No token provided" });

    const token = header.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Invalid token format" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (except password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ message: "User not found or token invalid" });

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
      error: err.name === "TokenExpiredError" ? "Token expired" : err.message,
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only route" });
  }
  next();
};
