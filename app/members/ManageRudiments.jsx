"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";
import { MOCK_MANAGE_RUDIMENTS } from "./rudimentsMock";

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
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
  if (key === "id") return row.id;
  if (key === "date") return parseDateish(row.date);
  if (key === "status") return String(row.status ?? "published").toLowerCase();
  return String(row[key] ?? "").toLowerCase();
}

function StatusCell({ status }) {
  const s = status === "draft" ? "draft" : "published";
  const isDraft = s === "draft";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isDraft ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
      }`}
    >
      {isDraft ? "Draft" : "Published"}
    </span>
  );
}

export function ManageRudiments({ member }) {
  const router = useRouter();
  const { sortKey, sortDir, toggleSort } = useTableSort("id", "desc");
  const sorted = useMemo(() => sortRows(MOCK_MANAGE_RUDIMENTS, sortKey, sortDir, rowValue), [sortKey, sortDir]);

  const [selected, setSelected] = useState(() => new Set());
  const allIds = sorted.map((r) => r.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(() => (allSelected ? new Set() : new Set(allIds)));
  }

  const manageBase = `/members/${member.id}/rudiments`;

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4] text-gray-900">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <nav className="text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Home
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li>
                <Link href="/members" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Members
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li>
                <Link href={`/members/${member.id}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                  {member.fullName}
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li className="font-medium text-gray-600">Manage Rudiments</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Rudiments</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
            <Link
              href={`${manageBase}/new`}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-gray-900"
            >
              Add Rudiment
            </Link>
          </div>

          <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <label className="relative block w-full max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                />
              </label>
              <button
                type="button"
                disabled={selected.size === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <IconTrash />
                Delete Selected
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableTh columnKey="id" label="ID" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-4 py-3 sm:px-5" />
                    <SortableTh columnKey="date" label="Date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-4 py-3 sm:px-5" />
                    <SortableTh columnKey="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-4 py-3 sm:px-5" />
                    <SortableTh columnKey="takenBy" label="Taken by" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-4 py-3 sm:px-5" />
                    <SortableTh columnKey="description" label="Description" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="min-w-[200px] px-4 py-3 sm:px-5" />
                    <th className="w-12 px-4 py-3 sm:px-5">
                      <span className="sr-only">Select</span>
                      <input type="checkbox" className="rounded border-gray-300" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-gray-100 transition-colors ${i % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200/70"}`}
                      onClick={() => router.push(`${manageBase}/${row.id}`)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 sm:px-5">{row.id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-5">{row.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                        <StatusCell status={row.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-5">{row.takenBy}</td>
                      <td className="max-w-md truncate px-4 py-3 text-gray-900 sm:px-5" title={row.description}>
                        {row.description}
                      </td>
                      <td className="px-4 py-3 sm:px-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selected.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          aria-label={`Select rudiment ${row.id}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
