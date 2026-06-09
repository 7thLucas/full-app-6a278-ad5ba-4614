import { Router, type Request, type Response } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../services/task.service";
import { createLogger } from "~/lib/logger";

const logger = createLogger("TasksRoutes");
const router = Router();

// GET /api/tasks?filter=active|completed|all
router.get("/api/tasks", async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as string) ?? "all";
    const validFilters = ["active", "completed", "all"];
    const safeFilter = validFilters.includes(filter) ? (filter as "active" | "completed" | "all") : "all";
    const tasks = await getAllTasks(safeFilter);
    res.json({ tasks });
  } catch (err) {
    logger.error("GET /api/tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET /api/tasks/:id
router.get("/api/tasks/:id", async (req: Request, res: Response) => {
  try {
    const task = await getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ task });
  } catch (err) {
    logger.error("GET /api/tasks/:id error:", err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// POST /api/tasks
router.post("/api/tasks", async (req: Request, res: Response) => {
  try {
    const { title, dueDate, priority } = req.body;
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }
    const task = await createTask({ title, dueDate, priority });
    res.status(201).json({ task });
  } catch (err) {
    logger.error("POST /api/tasks error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PATCH /api/tasks/:id
router.patch("/api/tasks/:id", async (req: Request, res: Response) => {
  try {
    const task = await updateTask(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ task });
  } catch (err) {
    logger.error("PATCH /api/tasks/:id error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/api/tasks/:id", async (req: Request, res: Response) => {
  try {
    const task = await deleteTask(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true });
  } catch (err) {
    logger.error("DELETE /api/tasks/:id error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
