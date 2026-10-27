import { Router } from "express";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/auth.js";
import { parse, taskSchema } from "../middleware/validate.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { search, status, priority, category, sort = "createdAt", page = "1", limit = "50" } = req.query;
    const filter = { owner: req.userId };
    if (status && ["todo", "in-progress", "completed"].includes(status)) filter.status = status;
    if (priority && ["low", "medium", "high"].includes(priority)) filter.priority = priority;
    if (category) filter.category = category;
    if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    const sortMap = { dueDate: { dueDate: 1 }, priority: { priority: -1 }, createdAt: { createdAt: -1 }, updatedAt: { updatedAt: -1 } };
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortMap[sort] || sortMap.createdAt).skip((safePage - 1) * safeLimit).limit(safeLimit),
      Task.countDocuments(filter)
    ]);
    res.json({ tasks, pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const input = parse(taskSchema, req.body);
    const task = await Task.create({ ...input, owner: req.userId, dueDate: input.dueDate ? new Date(input.dueDate) : null });
    res.status(201).json({ task });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ task });
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const input = parse(taskSchema, req.body);
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { ...input, dueDate: input.dueDate ? new Date(input.dueDate) : null },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ task });
  } catch (error) { next(error); }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = parse(taskSchema.pick({ status: true }), req.body);
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, { status }, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ task });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) { next(error); }
});

export default router;
