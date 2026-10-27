import { createMemoryModel } from "./memoryModel.js";

const Task = createMemoryModel("Task", {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: null,
  category: "General",
  owner: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

export default Task;
