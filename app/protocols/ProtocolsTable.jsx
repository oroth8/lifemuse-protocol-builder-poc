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

function protocolValue(row, key) {
  if (key === "updated") return parseDateish(row.updated);
  if (key === "id") {
    const n = parseInt(String(row.id).replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? row.id : n;
  }
  return String(row[key] ?? "").toLowerCase();
}

export function ProtocolsTable({ rows }) {
  const { sortKey, sortDir, toggleSort } = useTableSort("updated", "desc");
  const sorted = useMemo(
    () => sortRows(rows, sortKey, sortDir, protocolValue),
    [rows, sortKey, sortDir],
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
            <SortableTh columnKey="id" label="ID" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="name" label="Name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="version" label="Version" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="updated" label="Updated" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <SortableTh columnKey="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
            <th className="w-12 px-6 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">{row.id}</td>
              <td className="px-6 py-3.5 text-gray-900">{row.name}</td>
              <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.version}</td>
              <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.updated}</td>
              <td className="whitespace-nowrap px-6 py-3.5">
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">{row.status}</span>
              </td>
              <td className="px-6 py-3.5">
                <button type="button" className="flex rounded p-1 hover:bg-gray-100" aria-label="Open protocol">
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
