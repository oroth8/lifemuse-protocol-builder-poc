/** Care plan item scheduling state — styles match manage-care-plan mocks. */
export function CarePlanStatusBadge({ status }) {
  const s = String(status || "unscheduled").toLowerCase();

  if (s === "completed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
        <span className="h-2 w-2 shrink-0 rounded-full bg-white" aria-hidden />
        Completed
      </span>
    );
  }
  if (s === "scheduled") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 ring-1 ring-emerald-200/80">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-800" aria-hidden />
        Scheduled
      </span>
    );
  }
  if (s === "overdue") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-900 ring-1 ring-red-200/90">
        <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
        Overdue
      </span>
    );
  }
  /* unscheduled */
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950 ring-1 ring-amber-200/90">
      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-800" aria-hidden />
      Unscheduled
    </span>
  );
}
