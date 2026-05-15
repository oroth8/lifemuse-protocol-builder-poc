/** @param {{ level?: string }} props — one of High, Medium, Low */
export function ReminderImportanceBadge({ level }) {
  const label = level === "High" || level === "Medium" || level === "Low" ? level : "Medium";
  const k = label.toLowerCase();

  if (k === "medium") {
    return (
      <span className="inline-flex items-center rounded-[10px] bg-[#FFCC00]/10 px-3 py-1 text-xs font-bold text-[#A5650C]">{label}</span>
    );
  }

  const tone =
    k === "high"
      ? "bg-red-50 text-red-800"
      : "bg-emerald-50 text-emerald-900";
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
  );
}
