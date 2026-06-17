"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { mergeCarePlanRow } from "../lib/carePlanOverrides";
import { SortableTh } from "../components/SortableTh";
import { TablePagination } from "../components/TablePagination";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";
import { CarePlanStatusBadge } from "./CarePlanStatusBadge";

const PAGE_SIZE = 10;

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function rowValue(row, key) {
  if (key === "dueDate") return parseDateish(row.dueAt);
  return String(row[key] ?? "").toLowerCase();
}

export function ManageCarePlan({ member, rows: allRows }) {
  const router = useRouter();
  const scrollAnchorRef = useRef(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [overrideTick, setOverrideTick] = useState(0);

  useEffect(() => {
    const bump = () => setOverrideTick((t) => t + 1);
    window.addEventListener("care-plan-status-updated", bump);
    return () => window.removeEventListener("care-plan-status-updated", bump);
  }, []);

  const mergedRows = useMemo(
    () => allRows.map((r) => mergeCarePlanRow(member.id, r)),
    [allRows, member.id, overrideTick],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mergedRows;
    return mergedRows.filter((r) =>
      [r.dueDate, r.itemName, r.type, r.protocol, r.pillar, r.provider, r.status].some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [mergedRows, search]);

  const { sortKey, sortDir, toggleSort } = useTableSort("dueDate", "desc");
  const sorted = useMemo(() => sortRows(filtered, sortKey, sortDir, rowValue), [filtered, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    const ids = pageRows.map((r) => r.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb
            crumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "Members", href: "/members" },
              { label: member.fullName, href: `/members/${member.id}` },
              { label: "Manage Care Plan" },
            ]}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage Care Plan</h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button type="button" className="btn-lifemuse-secondary">
                Add Item
              </button>
              <Link href="/protocol-builder" className="btn-lifemuse-primary">
                Add Protocol
              </Link>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
              <label className="relative block min-w-[200px] flex-1 sm:max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search care plan items"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200/80 disabled:opacity-40"
                  disabled={selected.size === 0}
                >
                  <IconCheck />
                  Mark complete
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                  disabled={selected.size === 0}
                >
                  <IconTrash />
                  Delete Selected
                </button>
              </div>
            </div>

            <div ref={scrollAnchorRef} className="scroll-mt-6" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <SortableTh columnKey="dueDate" label="Due Date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                    <SortableTh columnKey="itemName" label="Item Name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                    <SortableTh columnKey="type" label="Type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                    <SortableTh columnKey="protocol" label="Protocol" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                    <SortableTh columnKey="pillar" label="Pillar" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                    <SortableTh columnKey="provider" label="Provider" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                    <SortableTh columnKey="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={allOnPageSelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all on this page"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, i) => {
                    const isUnscheduled = String(row.status).toLowerCase() === "unscheduled";
                    const openEdit = () => {
                      if (isUnscheduled) router.push(`/members/${member.id}/care-plan/edit/${row.id}`);
                    };
                    return (
                    <tr
                      key={row.id}
                      role={isUnscheduled ? "link" : undefined}
                      tabIndex={isUnscheduled ? 0 : undefined}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/80"} ${isUnscheduled ? "cursor-pointer hover:bg-sky-50/50" : ""}`}
                      onClick={openEdit}
                      onKeyDown={(e) => {
                        if (!isUnscheduled) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openEdit();
                        }
                      }}
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{row.dueDate}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-left font-medium ${isUnscheduled ? "text-blue-600" : "text-gray-900"}`}>{row.itemName}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-gray-900">{row.type}</td>
                      <td className="px-4 py-3.5 text-gray-900">{row.protocol}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-gray-700">{row.pillar}</td>
                      <td className="max-w-[140px] truncate px-4 py-3.5 text-gray-700" title={row.provider}>
                        {row.provider}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <CarePlanStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selected.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          aria-label={`Select ${row.itemName}`}
                        />
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
              onPageChange={(p) => setPage(p)}
              scrollAnchorRef={scrollAnchorRef}
              ariaLabel="Care plan pagination"
            />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
