# MyToDo — Design Guidelines

## Color Palette
- Primary: Indigo (#4f46e5) — used for CTAs, active states, focus rings
- Success / Done accent: Emerald green (#10b981) — completed task indicators, checkmarks
- Neutral: Slate scale — backgrounds, text, borders
- Danger/overdue: Red-500 for past-due date highlights

## Typography
- Font family: Inter (system fallback: sans-serif)
- Scale: Tailwind defaults (text-sm for metadata, text-base for task titles, text-lg/xl for headings)
- Weight: Regular for body, Semibold for headings and priority labels
- Line-through on completed task titles

## Priority Badge Colors
- High: Red-100 background, Red-700 text
- Medium: Amber-100 background, Amber-700 text
- Low: Slate-100 background, Slate-600 text

## Components
- Task card: white card with subtle shadow, rounded-lg, hover:shadow-md transition
- Add Task form: clean modal or inline form with labeled fields; primary Indigo button to submit
- Filter toggle: segmented control (Active / Completed) in Indigo; inactive tab is slate
- Checkbox: custom rounded checkbox, unchecked=slate border, checked=Indigo fill with white checkmark; completed tasks get Emerald green styling
- Empty state: centered illustration or icon + calm encouraging message

## Elevation & Motion
- Cards: shadow-sm default, shadow-md on hover
- Modal/form: shadow-xl, slight scale-in animation on open (scale 0.95 -> 1)
- Transitions: 150ms ease-in-out on all interactive states
- Completing a task: brief fade + strikethrough animation

## Layout
- Single-column centered layout, max-width 640px
- Header: app name + tagline
- Filter tabs below header
- Task list fills remaining space
- Floating or pinned "Add Task" button (bottom-right FAB or top-right button)

## Accessibility
- Focus-visible rings in Indigo
- Sufficient color contrast (WCAG AA minimum)
- Keyboard-navigable form and task actions