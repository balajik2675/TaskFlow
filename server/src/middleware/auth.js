import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(req, res, next) {
  const token = req.cookies.taskflow_token;
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired" });
  }
}
