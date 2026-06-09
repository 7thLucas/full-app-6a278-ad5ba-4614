// Shared types for tasks — safe to import on both client and server

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  _id: string;
  title: string;
  dueDate?: string | null;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
}
