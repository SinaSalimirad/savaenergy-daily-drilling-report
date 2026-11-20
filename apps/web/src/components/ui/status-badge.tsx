import { cn } from "cn";
import type { ProjectStatus, WellStatus } from "schema";

// One colour per status, shared by projects and wells. A project is "active" when one of its
// wells is, so "active" must look the same on both pages.
const STATUS_STYLES: Record<ProjectStatus | WellStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  inactive:
    "bg-slate-200 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  archived:
    "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  planned: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  completed:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-300",
  suspended:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
};

/** A status as a coloured pill. The API stores lowercase values; the label is display only. */
export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus | WellStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs capitalize",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
