"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";

function attentionValue(row, key) {
  if (key === "date") return parseDateish(row.date);
  return String(row[key] ?? "").toLowerCase();
}

function StatusBadge({ status }) {
  const isApproved = String(status).toLowerCase().includes("approved") && !String(status).toLowerCase().includes("awaiting");
  if (isApproved) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
      <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
      {status}
    </span>
  );
}

export function NeedsAttentionTable({ rows }) {
  const router = useRouter();
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
          {sorted.map((row, i) => {
            const href = row.protocolBuilderHref;
            const interactive = Boolean(href);
            return (
              <tr
                key={row.id ?? `${row.date}-${row.member}-${i}`}
                className={`${i % 2 === 0 ? "bg-white" : "bg-gray-100"} ${interactive ? "cursor-pointer hover:bg-gray-200/60" : ""}`}
                role={interactive ? "link" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onClick={() => {
                  if (href) router.push(href);
                }}
                onKeyDown={(e) => {
                  if (!href) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(href);
                  }
                }}
              >
                <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.date}</td>
                <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">{row.member}</td>
                <td className="px-6 py-3.5 text-gray-900">{row.task}</td>
                <td className="max-w-xs truncate px-6 py-3.5 text-gray-600">{row.description}</td>
                <td className="whitespace-nowrap px-6 py-3.5">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-3.5">
                  <span className="flex rounded p-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
