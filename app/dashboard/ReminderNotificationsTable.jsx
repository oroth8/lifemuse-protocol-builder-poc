"use client";

import { useMemo } from "react";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const SORT_KEYS = ["id", "date", "from", "title", "description"];

const HEADER_LABEL = {
  id: "ID",
  date: "Date",
  from: "From",
  title: "Title",
  description: "Description",
};

function reminderValue(row, key) {
  if (key === "date") return parseDateish(row.date);
  if (key === "id") {
    const n = parseInt(row.id.replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? row.id : n;
  }
  return String(row[key]).toLowerCase();
}

export function ReminderNotificationsTable({ rows }) {
  const { sortKey, sortDir, toggleSort } = useTableSort("date", "desc");
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir, reminderValue), [rows, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
            {SORT_KEYS.map((key) => (
              <SortableTh
                key={key}
                columnKey={key}
                label={HEADER_LABEL[key]}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
                className="px-6 py-3"
              />
            ))}
            <th className="w-12 px-6 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">{row.id}</td>
              <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.date}</td>
              <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.from}</td>
              <td className="px-6 py-3.5 text-gray-900">{row.title}</td>
              <td className="max-w-xs truncate px-6 py-3.5 text-gray-600">{row.description}</td>
              <td className="px-6 py-3.5">
                <button type="button" className="flex rounded p-1 hover:bg-gray-100" aria-label="View reminder">
                  <IconChevron />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
