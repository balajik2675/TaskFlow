import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { env } from "./env.js";

export async function connectDatabase() {
  try {
    const mongoose = await import("mongoose");
    await mongoose.default.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB");
    return;
  } catch (error) {
    console.warn("MongoDB unavailable, using in-memory development store.");
  }

  const count = await User.countDocuments({});
  if (count === 0) {
    await User.create({
      name: "Demo Admin",
      email: "admin@taskflow.local",
      passwordHash: await bcrypt.hash("Admin123!", 12)
    });
    console.log("Seeded demo user: admin@taskflow.local / Admin123!");
  }
}
