import { useState, useCallback, useRef, useEffect } from "react";
import { useConfigurables } from "~/modules/configurables";
import { TaskBadge } from "~/components/task-badge";
import type { Task, TaskPriority } from "~/tasks/types";

type FilterView = "active" | "completed";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(dateStr?: string | null, completed?: boolean): boolean {
  if (!dateStr || completed) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// ─── Add Task Form ────────────────────────────────────────────────────────────

interface AddTaskFormProps {
  onAdd: (task: Task) => void;
  addButtonLabel: string;
}

function AddTaskForm({ onAdd, addButtonLabel }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) {
        setError("Task title cannot be empty.");
        titleRef.current?.focus();
        return;
      }
      setError(null);
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed, dueDate: dueDate || null, priority }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to create task");
        }
        const { task } = await res.json();
        onAdd(task);
        setTitle("");
        setDueDate("");
        setPriority("medium");
        titleRef.current?.focus();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, dueDate, priority, onAdd],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6"
      aria-label="Add new task"
    >
      <div className="flex flex-col gap-3">
        {/* Title input */}
        <div>
          <label htmlFor="task-title" className="block text-xs font-semibold text-slate-500 mb-1">
            Task
          </label>
          <input
            ref={titleRef}
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to get done?"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            disabled={isSubmitting}
            autoComplete="off"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Due date + priority row */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[130px]">
            <label htmlFor="task-due" className="block text-xs font-semibold text-slate-500 mb-1">
              Due Date
            </label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-500 mb-1">
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              disabled={isSubmitting}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {isSubmitting ? "Adding..." : addButtonLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const overdue = isOverdue(task.dueDate, task.completed);
  const dateLabel = formatDate(task.dueDate);

  const handleToggle = useCallback(async () => {
    setIsToggling(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        // Animate out, then notify parent
        setIsVisible(false);
        setTimeout(() => onToggle(task._id, !task.completed), 250);
      }
    } finally {
      setIsToggling(false);
    }
  }, [task._id, task.completed, onToggle]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, { method: "DELETE" });
      if (res.ok) {
        setIsVisible(false);
        setTimeout(() => onDelete(task._id), 250);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [task._id, onDelete]);

  return (
    <div
      className={`flex items-start gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm hover:shadow-md transition-all duration-150 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
      }`}
      style={{ transition: "opacity 0.25s ease, transform 0.25s ease, box-shadow 0.15s ease" }}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling}
        aria-label={task.completed ? "Mark as active" : "Mark as done"}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 ${
          task.completed
            ? "bg-emerald-500 border-emerald-500"
            : "bg-white border-slate-300 hover:border-indigo-400"
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm text-slate-800 font-medium leading-snug break-words transition-all duration-150 ${
            task.completed ? "line-through text-slate-400" : ""
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <TaskBadge priority={task.priority} />
          {dateLabel && (
            <span
              className={`text-xs font-medium flex items-center gap-0.5 ${
                overdue ? "text-red-500" : "text-slate-400"
              }`}
            >
              {overdue && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              )}
              {!overdue && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {dateLabel}
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete task"
        className="flex-shrink-0 mt-0.5 text-slate-300 hover:text-red-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 rounded disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

interface FilterTabsProps {
  activeFilter: FilterView;
  onFilterChange: (f: FilterView) => void;
  activeCount: number;
  completedCount: number;
  activeLabel: string;
  completedLabel: string;
}

function FilterTabs({ activeFilter, onFilterChange, activeCount, completedCount, activeLabel, completedLabel }: FilterTabsProps) {
  const tabs: { key: FilterView; label: string; count: number }[] = [
    { key: "active", label: activeLabel, count: activeCount },
    { key: "completed", label: completedLabel, count: completedCount },
  ];

  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6" role="tablist" aria-label="Task filter">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeFilter === tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${
            activeFilter === tab.key
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold transition-colors ${
              activeFilter === tab.key ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message, filter }: { message: string; filter: FilterView }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        {filter === "completed" ? (
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
      </div>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IndexPage() {
  const { config, loading } = useConfigurables();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterView>("active");

  // Derive configurable labels with safe fallbacks
  const appName = loading ? "MyToDo" : (config?.appName ?? "MyToDo");
  const tagline = loading ? "" : (config?.tagline ?? "Your tasks. Your pace. Your way.");
  const emptyStateMessage = loading ? "" : (config?.emptyStateMessage ?? "Nothing here yet.");
  const addButtonLabel = loading ? "Add Task" : (config?.addTaskButtonLabel ?? "Add Task");
  const activeLabel = loading ? "Active" : (config?.activeFilterLabel ?? "Active");
  const completedLabel = loading ? "Completed" : (config?.completedFilterLabel ?? "Completed");

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const { tasks: fetched } = await res.json();
      setTasks(fetched ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Could not load tasks.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Task mutations
  const handleAdd = useCallback((newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setActiveFilter("active");
  }, []);

  const handleToggle = useCallback((id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, completed } : t)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  // Filtered views
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const visibleTasks = activeFilter === "active" ? activeTasks : completedTasks;

  const emptyMessage =
    activeFilter === "completed"
      ? "No completed tasks yet. Finish one and it will appear here."
      : emptyStateMessage;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f1f5f9" }}>
      {/* Header */}
      <header className="pt-10 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
            {appName}
          </h1>
          {tagline && (
            <p className="mt-0.5 text-sm text-slate-400">{tagline}</p>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pb-20 max-w-lg mx-auto">
        {/* Add task form */}
        <AddTaskForm onAdd={handleAdd} addButtonLabel={addButtonLabel} />

        {/* Filter tabs */}
        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeCount={activeTasks.length}
          completedCount={completedTasks.length}
          activeLabel={activeLabel}
          completedLabel={completedLabel}
        />

        {/* Task list */}
        {isFetching ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500 mb-3">{fetchError}</p>
            <button
              onClick={fetchTasks}
              className="text-xs text-indigo-500 hover:text-indigo-600 underline focus:outline-none"
            >
              Try again
            </button>
          </div>
        ) : visibleTasks.length === 0 ? (
          <EmptyState message={emptyMessage} filter={activeFilter} />
        ) : (
          <div className="flex flex-col gap-2.5">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
