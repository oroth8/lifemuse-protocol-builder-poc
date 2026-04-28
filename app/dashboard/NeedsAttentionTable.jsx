"use client";

import { useMemo } from "react";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";

function attentionValue(row, key) {
  if (key === "date") return parseDateish(row.date);
  return String(row[key] ?? "").toLowerCase();
}

export function NeedsAttentionTable({ rows }) {
  const { sortKey, sortDir, toggleSort } = useTableSort("date", "desc");
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir, attentionValue), [rows, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
            <SortableTh columnKey="date" label="Date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="member" label="Member" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="task" label="Task" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="description" label="Description" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <th className="w-12 px-6 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={`${row.date}-${row.member}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.date}</td>
              <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">{row.member}</td>
              <td className="px-6 py-3.5 text-gray-900">{row.task}</td>
              <td className="max-w-xs truncate px-6 py-3.5 text-gray-600">{row.description}</td>
              <td className="whitespace-nowrap px-6 py-3.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                  <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-3.5">
                <button type="button" className="flex rounded p-1 hover:bg-gray-100" aria-label="View task">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
