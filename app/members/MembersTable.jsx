"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { sortRows } from "../lib/tableSort";

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function memberValue(row, key) {
  if (key === "id") return row.id;
  return String(row[key] ?? "").toLowerCase();
}

export function MembersTable({ rows }) {
  const router = useRouter();
  const { sortKey, sortDir, toggleSort } = useTableSort("id", "asc");
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir, memberValue), [rows, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="w-10 px-3 py-3 sm:px-4">
              <span className="sr-only">Select</span>
              <input type="checkbox" className="rounded border-gray-300 text-gray-900" aria-label="Select all" />
            </th>
            <SortableTh columnKey="id" label="ID" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-3 py-3 sm:px-4" />
            <SortableTh columnKey="fullName" label="Full name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-3 py-3 sm:px-4" />
            <SortableTh columnKey="email" label="Email address" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-3 py-3 sm:px-4" />
            <SortableTh columnKey="memberType" label="Member type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-3 py-3 sm:px-4" />
            <SortableTh columnKey="membership" label="Membership" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-3 py-3 sm:px-4" />
            <SortableTh columnKey="salesforceId" label="Salesforce ID" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="whitespace-nowrap px-3 py-3 sm:px-4" />
            <th className="whitespace-nowrap px-3 py-3 sm:px-4">Avatar</th>
            <th className="w-[120px] px-3 py-3 sm:px-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.id}
              className={`cursor-pointer border-b border-gray-100 transition-colors ${i % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200/70"}`}
              onClick={() => router.push(`/members/${row.id}`)}
            >
              <td className="px-3 py-3 sm:px-4" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="rounded border-gray-300" aria-label={`Select ${row.fullName}`} />
              </td>
              <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-900 sm:px-4">{row.id}</td>
              <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-900 sm:px-4">{row.fullName}</td>
              <td className="whitespace-nowrap px-3 py-3 text-gray-600 sm:px-4">{row.email}</td>
              <td className="whitespace-nowrap px-3 py-3 text-gray-600 sm:px-4 capitalize">{row.memberType}</td>
              <td className="whitespace-nowrap px-3 py-3 text-gray-600 sm:px-4">{row.membership}</td>
              <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-gray-600 sm:px-4">{row.salesforceId}</td>
              <td className="px-3 py-3 sm:px-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700" aria-hidden>
                  {row.initials}
                </span>
              </td>
              <td className="px-3 py-3 sm:px-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <Link href={`/members/${row.id}`} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" aria-label={`View ${row.fullName}`}>
                    <IconEye />
                  </Link>
                  <button type="button" className="rounded-md p-1.5 hover:bg-gray-100" aria-label={`Edit ${row.fullName}`}>
                    <IconPencil />
                  </button>
                  <button type="button" className="rounded-md p-1.5 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${row.fullName}`}>
                    <IconTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
