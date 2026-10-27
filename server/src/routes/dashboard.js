import { Router } from "express";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/stats", requireAuth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.userId }).sort({ createdAt: -1 });
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const overdue = tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== "completed").length;
    res.json({
      stats: {
        total, completed, pending: tasks.filter((task) => task.status === "todo").length,
        inProgress: tasks.filter((task) => task.status === "in-progress").length, overdue,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
        priority: { high: tasks.filter((task) => task.priority === "high").length, medium: tasks.filter((task) => task.priority === "medium").length, low: tasks.filter((task) => task.priority === "low").length },
        recent: tasks.slice(0, 5), upcoming: tasks.filter((task) => task.dueDate && task.dueDate >= now && task.status !== "completed").sort((a, b) => a.dueDate - b.dueDate).slice(0, 5)
      }
    });
  } catch (error) { next(error); }
});
export default router;
