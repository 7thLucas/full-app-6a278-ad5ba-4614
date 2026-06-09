import { TaskModel } from "../models/task.model";
import type { TaskPriority } from "~/tasks/types";

export interface CreateTaskInput {
  title: string;
  dueDate?: string | null;
  priority?: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  completed?: boolean;
}

export async function getAllTasks(filter?: "active" | "completed" | "all") {
  const query: Record<string, unknown> = {};
  if (filter === "active") query.completed = false;
  if (filter === "completed") query.completed = true;

  const tasks = await TaskModel.find(query).sort({ createdAt: -1 }).lean();
  return tasks;
}

export async function getTaskById(id: string) {
  return TaskModel.findById(id).lean();
}

export async function createTask(input: CreateTaskInput) {
  const task = await TaskModel.create({
    title: input.title.trim(),
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    priority: input.priority ?? "medium",
    completed: false,
  });
  return task.toObject();
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const updateData: Record<string, unknown> = {};

  if (typeof input.title === "string") updateData.title = input.title.trim();
  if (input.dueDate !== undefined) updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (typeof input.completed === "boolean") {
    updateData.completed = input.completed;
    updateData.completedAt = input.completed ? new Date() : null;
  }

  const task = await TaskModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
  return task;
}

export async function deleteTask(id: string) {
  const result = await TaskModel.findByIdAndDelete(id).lean();
  return result;
}
