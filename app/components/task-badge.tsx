import type { TaskPriority } from "~/tasks/types";

interface TaskBadgeProps {
  priority: TaskPriority;
}

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  high: { bg: "bg-red-100", text: "text-red-700", label: "High" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  low: { bg: "bg-slate-100", text: "text-slate-600", label: "Low" },
};

export function TaskBadge({ priority }: TaskBadgeProps) {
  const styles = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}
    >
      {styles.label}
    </span>
  );
}
