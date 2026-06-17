"use client";

function IconSort({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m8 9 4-4 4 4" />
      <path d="m16 15-4 4-4-4" />
    </svg>
  );
}

export function SortableTh({ columnKey, label, sortKey, sortDir, onSort, className, detail }) {
  const active = sortKey === columnKey;
  const btnClass = detail
    ? `inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-gray-700 ${active ? "text-gray-800" : "text-gray-500"}`
    : `inline-flex items-center gap-1 font-semibold hover:text-gray-700 ${active ? "text-gray-800" : "text-gray-500"}`;
  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={btnClass}
        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      >
        {label}
        <IconSort className={active ? "text-gray-700" : "text-gray-400"} />
      </button>
    </th>
  );
}
