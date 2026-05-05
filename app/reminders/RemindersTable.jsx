"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SortableTh } from "../components/SortableTh";
import { TablePagination } from "../components/TablePagination";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";

function reminderValue(row, key) {
  if (key === "displayDate") return parseDateish(row.createdAt);
  if (key === "id") {
    const n = parseInt(String(row.id), 10);
    return Number.isNaN(n) ? row.id : n;
  }
  return String(row[key] ?? "").toLowerCase();
}

function IconChevronRow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const PAGE_SIZE = 5;

export function RemindersTable({ rows }) {
  const scrollAnchorRef = useRef(null);
  const router = useRouter();
  const { sortKey, sortDir, toggleSort } = useTableSort("displayDate", "desc");
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir, reminderValue), [rows, sortKey, sortDir]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [sortKey, sortDir]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div>
      <div ref={scrollAnchorRef} className="scroll-mt-6" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
              <SortableTh columnKey="id" label="ID" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <SortableTh columnKey="displayDate" label="Date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <SortableTh columnKey="to" label="To" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <SortableTh columnKey="title" label="Title" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <SortableTh columnKey="description" label="Description" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <th className="w-12 px-6 py-3" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((row, i) => (
              <tr
                key={row.id}
                role="link"
                tabIndex={0}
                className={`cursor-pointer border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"} hover:bg-gray-100/80`}
                onClick={() => router.push(`/reminders/${row.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/reminders/${row.id}`);
                  }
                }}
              >
                <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">{row.id}</td>
                <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.displayDate}</td>
                <td className="whitespace-nowrap px-6 py-3.5 text-gray-900">{row.to}</td>
                <td className="px-6 py-3.5 text-gray-900">{row.title}</td>
                <td className="max-w-md truncate px-6 py-3.5 text-gray-600">{row.description}</td>
                <td className="px-6 py-3.5">
                  <span className="flex rounded p-1">
                    <IconChevronRow />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        scrollAnchorRef={scrollAnchorRef}
        ariaLabel="Reminders pagination"
      />
    </div>
  );
}
