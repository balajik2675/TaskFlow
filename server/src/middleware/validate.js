import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100)
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().max(2000).optional().default(""),
  status: z.enum(["todo", "in-progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
  category: z.string().trim().max(40).optional()
});

export function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || "Invalid request data");
    error.status = 400;
    throw error;
  }
  return result.data;
}
