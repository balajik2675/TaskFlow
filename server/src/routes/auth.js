import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { loginSchema, parse, registerSchema } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  secure: env.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
});
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

router.post("/register", async (req, res, next) => {
  try {
    const input = parse(registerSchema, req.body);
    const exists = await User.findOne({ email: input.email });
    if (exists) return res.status(409).json({ message: "An account with that email already exists" });
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12)
    });
    const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, { expiresIn: "7d" });
    res.cookie("taskflow_token", token, cookieOptions()).status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const input = parse(loginSchema, req.body);
    const user = await User.findOne({ email: input.email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    const token = jwt.sign({ userId: user._id.toString() }, env.jwtSecret, { expiresIn: "7d" });
    res.cookie("taskflow_token", token, cookieOptions()).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post("/logout", (req, res) => {
  res.clearCookie("taskflow_token", { httpOnly: true, sameSite: env.nodeEnv === "production" ? "none" : "lax", secure: env.nodeEnv === "production" });
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

export default router;
