"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SortableTh } from "../components/SortableTh";
import { TablePagination } from "../components/TablePagination";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";

const PAGE_SIZE = 12;

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function inboxValue(row, key) {
  if (key === "date") return parseDateish(row.lastAtISO);
  if (key === "from") return String(row.lastFrom ?? "").toLowerCase();
  if (key === "message") return String(row.preview ?? "").toLowerCase();
  return "";
}

export function MessagesInboxTable({ rows }) {
  const scrollAnchorRef = useRef(null);
  const router = useRouter();
  const { sortKey, sortDir, toggleSort } = useTableSort("date", "desc");
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir, inboxValue), [rows, sortKey, sortDir]);
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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
              <SortableTh columnKey="date" label="Date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <SortableTh columnKey="from" label="From" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <SortableTh columnKey="message" label="Message" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-6 py-3" />
              <th className="w-12 px-6 py-3" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((row, i) => {
              const href = `/messages/${encodeURIComponent(row.threadId)}`;
              const strong = row.unread ? "font-semibold text-gray-900" : "text-gray-600";
              return (
                <tr
                  key={row.threadId}
                  role="link"
                  tabIndex={0}
                  aria-label={`Open messages with ${row.memberName}`}
                  className={`cursor-pointer border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"} hover:bg-gray-100/80`}
                  onClick={() => router.push(href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(href);
                    }
                  }}
                >
                  <td className={`whitespace-nowrap px-6 py-3.5 ${strong}`}>{row.displayDate}</td>
                  <td className={`whitespace-nowrap px-6 py-3.5 ${row.unread ? "font-semibold text-gray-900" : "text-gray-600"}`}>{row.lastFrom}</td>
                  <td className={`min-w-0 max-w-md truncate px-6 py-3.5 ${row.unread ? "font-semibold text-gray-900" : "text-gray-600"}`}>{row.preview}</td>
                  <td className="px-6 py-3.5">
                    <span className="flex rounded p-1 text-gray-400" aria-hidden>
                      <IconChevron />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        scrollAnchorRef={scrollAnchorRef}
        ariaLabel="Messages inbox pagination"
      />
    </div>
  );
}
