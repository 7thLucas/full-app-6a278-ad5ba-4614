/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  tagline?: string;
  brandColor: TBrandColor;
  emptyStateMessage?: string;
  addTaskButtonLabel?: string;
  activeFilterLabel?: string;
  completedFilterLabel?: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "MyToDo",
  logoUrl: "FILL_LOGO_URL_HERE",
  tagline: "Your tasks. Your pace. Your way.", // fill it here
  brandColor: {
    primary: "#4f46e5",
    secondary: "#10b981",
    accent: "#f1f5f9",
  },
  emptyStateMessage: "Nothing here yet — add your first task above.", // fill it here
  addTaskButtonLabel: "Add Task", // fill it here
  activeFilterLabel: "Active", // fill it here
  completedFilterLabel: "Completed", // fill it here
};
