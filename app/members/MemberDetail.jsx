"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";
import { MOCK_FEEDBACK_SUMMARY } from "./feedbackSummaryMock";
import { MOCK_PROGRESS_NOTES } from "./progressNotesMock";

function IconChevronSection({ expanded }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-gray-500 transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconPencilSm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconPencilRow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrashRow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function TableFooter({ count, perPage = 12 }) {
  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <select className="rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-900 focus:border-gray-300 focus:outline-none" defaultValue={String(perPage)}>
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="48">48</option>
        </select>
        <span>Per Page</span>
      </label>
      <p className="text-sm text-gray-600">
        Displaying {count} item{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function RowActions() {
  return (
    <div className="flex justify-end gap-1">
      <button type="button" className="rounded-md p-1.5 hover:bg-gray-100" aria-label="Delete row">
        <IconTrashRow />
      </button>
      <button type="button" className="rounded-md p-1.5 hover:bg-gray-100" aria-label="Edit row">
        <IconPencilRow />
      </button>
    </div>
  );
}

function CollapsibleSection({ id, title, actionLabel, headerAction, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = `section-${id}`;

  return (
    <section className="mb-4 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
        <button
          type="button"
          id={`${sectionId}-toggle`}
          aria-expanded={open}
          aria-controls={`${sectionId}-panel`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left hover:opacity-90 sm:flex-initial"
        >
          <span className="text-base font-semibold text-gray-900">{title}</span>
          <IconChevronSection expanded={open} />
        </button>
        {headerAction ?? (
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {open ? (
        <div id={`${sectionId}-panel`} role="region" aria-labelledby={`${sectionId}-toggle`}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

const RUDIMENTS = [
  { id: 101, date: "Mar 12, 2026", practitioner: "Dr. Chen", assessment: "Initial", protocol: "Metabolic baseline", status: "Complete" },
  { id: 98, date: "Feb 01, 2026", practitioner: "Dr. Chen", assessment: "Follow-up", protocol: "Gut protocol", status: "In progress" },
  { id: 94, date: "Jan 10, 2026", practitioner: "A. Ruiz", assessment: "Screening", protocol: "Diagnostics prep", status: "Complete" },
];

const ALLOCATED = [
  { service: "HEOT", total: 12, used: 4, remaining: 8, frequency: "Weekly" },
  { service: "Percussive recovery", total: 8, used: 8, remaining: 0, frequency: "Biweekly" },
  { service: "Cryo IV", total: 4, used: 1, remaining: 3, frequency: "Monthly" },
];

const RELATED = [
  { id: 67, name: "Dasecond Doe", type: "Secondary", relation: "Spouse" },
  { id: 69, name: "Nico Zubia", type: "Dependent", relation: "Child" },
];

const CARE_PLAN = [
  { start: "Jan 01, 2026", end: "Mar 31, 2026", pillar: "Nutrition", protocol: "Anti-inflammatory", type: "Structured", name: "Phase 1 elimination", frequency: "Daily", status: "completed" },
  { start: "Apr 01, 2026", end: "Jun 30, 2026", pillar: "Training", protocol: "PPL hypertrophy", type: "Exercise", name: "Strength block A", frequency: "6x / week", status: "scheduled" },
];

const PROTOCOLS_ROWS = [
  { name: "Foundational metabolic support", version: "2.1", start: "Jan 2026", status: "active" },
  { name: "Recovery & regeneration", version: "3.4", start: "Mar 2026", status: "active" },
];

const DIAGNOSTICS = [
  { category: "Blood panel", collected: "Mar 22, 2026", items: "CBC, CMP, lipids", results: "Available" },
  { category: "GI mapping", collected: "Feb 10, 2026", items: "GI-MAP", results: "Reviewed" },
];

const DOCUMENTS = [
  { name: "Document_1.pdf", uploaded: "Mar 01, 2026" },
  { name: "imaging_report.pdf", uploaded: "Feb 14, 2026" },
];

function badgeStatus(status) {
  const s = status.toLowerCase();
  if (s === "completed" || s === "active" || s === "complete")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (s === "scheduled" || s === "in progress")
    return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-gray-200 bg-gray-50 text-gray-700";
}

function NoteStatusPill({ status }) {
  const isDraft = status === "draft";
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

export function MemberDetail({ member }) {
  const displayName = member.fullName;

  const rudSort = useTableSort("date", "desc");
  const rudSorted = useMemo(
    () =>
      sortRows(RUDIMENTS, rudSort.sortKey, rudSort.sortDir, (r, k) => {
        if (k === "id") return r.id;
        if (k === "date") return parseDateish(r.date);
        return String(r[k] ?? "").toLowerCase();
      }),
    [rudSort.sortKey, rudSort.sortDir],
  );

  const allocSort = useTableSort("service", "asc");
  const allocSorted = useMemo(
    () =>
      sortRows(ALLOCATED, allocSort.sortKey, allocSort.sortDir, (r, k) => {
        if (k === "total" || k === "used" || k === "remaining") return r[k];
        return String(r[k] ?? "").toLowerCase();
      }),
    [allocSort.sortKey, allocSort.sortDir],
  );

  const relSort = useTableSort("id", "asc");
  const relSorted = useMemo(
    () =>
      sortRows(RELATED, relSort.sortKey, relSort.sortDir, (r, k) => {
        if (k === "id") return r.id;
        return String(r[k] ?? "").toLowerCase();
      }),
    [relSort.sortKey, relSort.sortDir],
  );

  const noteSort = useTableSort("date", "desc");
  const noteSorted = useMemo(
    () =>
      sortRows(MOCK_PROGRESS_NOTES, noteSort.sortKey, noteSort.sortDir, (r, k) => {
        if (k === "id") return r.id;
        if (k === "date") return parseDateish(r.date);
        if (k === "status") return String(r.status ?? "published").toLowerCase();
        return String(r[k] ?? "").toLowerCase();
      }),
    [noteSort.sortKey, noteSort.sortDir],
  );

  const careSort = useTableSort("start", "desc");
  const careSorted = useMemo(
    () =>
      sortRows(CARE_PLAN, careSort.sortKey, careSort.sortDir, (r, k) => {
        if (k === "start" || k === "end") return parseDateish(r[k]);
        return String(r[k] ?? "").toLowerCase();
      }),
    [careSort.sortKey, careSort.sortDir],
  );

  const protoSort = useTableSort("name", "asc");
  const protoSorted = useMemo(
    () => sortRows(PROTOCOLS_ROWS, protoSort.sortKey, protoSort.sortDir, (r, k) => String(r[k] ?? "").toLowerCase()),
    [protoSort.sortKey, protoSort.sortDir],
  );

  const diagSort = useTableSort("category", "asc");
  const diagSorted = useMemo(
    () =>
      sortRows(DIAGNOSTICS, diagSort.sortKey, diagSort.sortDir, (r, k) => {
        if (k === "collected") return parseDateish(r.collected);
        return String(r[k] ?? "").toLowerCase();
      }),
    [diagSort.sortKey, diagSort.sortDir],
  );

  const fbSort = useTableSort("id", "desc");
  const fbSorted = useMemo(
    () =>
      sortRows(MOCK_FEEDBACK_SUMMARY, fbSort.sortKey, fbSort.sortDir, (r, k) => {
        if (k === "id") return r.id;
        return String(r[k] ?? "").toLowerCase();
      }),
    [fbSort.sortKey, fbSort.sortDir],
  );

  const docSort = useTableSort("name", "asc");
  const docSorted = useMemo(
    () =>
      sortRows(DOCUMENTS, docSort.sortKey, docSort.sortDir, (r, k) => {
        if (k === "uploaded") return parseDateish(r.uploaded);
        return String(r[k] ?? "").toLowerCase();
      }),
    [docSort.sortKey, docSort.sortDir],
  );

  const infoRows = [
    ["Household ID", member.householdId],
    ["First name", member.firstName],
    ["Last name", member.lastName],
    ["Allergens", member.allergens],
    ["Blood type", member.bloodType],
    ["Email", member.email],
    ["Phone", member.phone],
    ["Birth date", member.birthDate],
    [
      "Type",
      <span
        key="type"
        className="inline-flex rounded-md border border-[#d4a853]/40 bg-[#d4a853]/12 px-2.5 py-0.5 text-xs font-semibold capitalize text-[#9a7328]"
      >
        {member.memberType}
      </span>,
    ],
    ["Status", member.status],
    ["Extra services balance", member.extraServicesBalance],
    ["Contraindications", member.contraindications],
  ];

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <PageBreadcrumb
            crumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "Members", href: "/members" },
              { label: displayName },
            ]}
          />

          <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{displayName}</h1>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2d2d2d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
            >
              <IconPencilSm />
              Edit
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <dl className="divide-y divide-gray-100">
              {infoRows.map(([label, value]) => (
                <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:items-center sm:px-5">
                  <dt className="text-sm font-medium text-gray-500">{label}</dt>
                  <dd className="text-sm text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 space-y-0">
            <CollapsibleSection
              id="rudiments"
              title="Rudiments"
              defaultOpen
              headerAction={
                <Link
                  href={`/members/${member.id}/rudiments`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
                >
                  Manage rudiments
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="id" label="ID" sortKey={rudSort.sortKey} sortDir={rudSort.sortDir} onSort={rudSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="date" label="Date" sortKey={rudSort.sortKey} sortDir={rudSort.sortDir} onSort={rudSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="practitioner" label="Practitioner" sortKey={rudSort.sortKey} sortDir={rudSort.sortDir} onSort={rudSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="assessment" label="Assessment" sortKey={rudSort.sortKey} sortDir={rudSort.sortDir} onSort={rudSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="protocol" label="Protocol / project" sortKey={rudSort.sortKey} sortDir={rudSort.sortDir} onSort={rudSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="status" label="Status" sortKey={rudSort.sortKey} sortDir={rudSort.sortDir} onSort={rudSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {rudSorted.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{r.id}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.date}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.practitioner}</td>
                        <td className="px-4 py-3 text-gray-600">{r.assessment}</td>
                        <td className="px-4 py-3 text-gray-900">{r.protocol}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.status}</td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={rudSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection id="allocated" title="Allocated services" actionLabel="Manage services">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="service" label="Service" sortKey={allocSort.sortKey} sortDir={allocSort.sortDir} onSort={allocSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="total" label="Total" sortKey={allocSort.sortKey} sortDir={allocSort.sortDir} onSort={allocSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="used" label="Used" sortKey={allocSort.sortKey} sortDir={allocSort.sortDir} onSort={allocSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="remaining" label="Remaining" sortKey={allocSort.sortKey} sortDir={allocSort.sortDir} onSort={allocSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="frequency" label="Frequency" sortKey={allocSort.sortKey} sortDir={allocSort.sortDir} onSort={allocSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {allocSorted.map((r, i) => (
                      <tr key={r.service} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.service}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.total}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.used}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.remaining}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.frequency}</td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={allocSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection id="related" title="Related members" actionLabel="Link member">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="id" label="ID" sortKey={relSort.sortKey} sortDir={relSort.sortDir} onSort={relSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="name" label="Name" sortKey={relSort.sortKey} sortDir={relSort.sortDir} onSort={relSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="type" label="Type" sortKey={relSort.sortKey} sortDir={relSort.sortDir} onSort={relSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="relation" label="Relation" sortKey={relSort.sortKey} sortDir={relSort.sortDir} onSort={relSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {relSorted.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{r.id}</td>
                        <td className="px-4 py-3 text-gray-900">
                          <Link href={`/members/${r.id}`} className="text-blue-600 hover:underline">
                            {r.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.type}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.relation}</td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={relSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection
              id="notes"
              title="Progress notes"
              headerAction={
                <Link
                  href={`/members/${member.id}/progress-notes`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
                >
                  Manage progress notes
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="id" label="ID" sortKey={noteSort.sortKey} sortDir={noteSort.sortDir} onSort={noteSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="date" label="Date" sortKey={noteSort.sortKey} sortDir={noteSort.sortDir} onSort={noteSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="practitioner" label="Practitioner" sortKey={noteSort.sortKey} sortDir={noteSort.sortDir} onSort={noteSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="itemRelated" label="Item related" sortKey={noteSort.sortKey} sortDir={noteSort.sortDir} onSort={noteSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="protocolRelated" label="Protocol related" sortKey={noteSort.sortKey} sortDir={noteSort.sortDir} onSort={noteSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="status" label="Status" sortKey={noteSort.sortKey} sortDir={noteSort.sortDir} onSort={noteSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {noteSorted.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                          <Link href={`/members/${member.id}/progress-notes/${r.id}`} className="text-blue-600 hover:underline">
                            {r.id}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.date}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.practitioner}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.itemRelated}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.protocolRelated}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <NoteStatusPill status={r.status} />
                        </td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={noteSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection
              id="care"
              title="Care plan"
              headerAction={
                <Link
                  href={`/members/${member.id}/care-plan`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
                >
                  Manage care plan
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="start" label="Start" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="end" label="End" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="pillar" label="Pillar" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="protocol" label="Protocol" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="type" label="Type" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="name" label="Care name" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="frequency" label="Frequency" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="status" label="Status" sortKey={careSort.sortKey} sortDir={careSort.sortDir} onSort={careSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {careSorted.map((r, i) => (
                      <tr key={`${r.start}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.start}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.end}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.pillar}</td>
                        <td className="px-4 py-3 text-gray-900">{r.protocol}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.type}</td>
                        <td className="px-4 py-3 text-gray-900">{r.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.frequency}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeStatus(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={careSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection
              id="protocols"
              title="Protocols"
              headerAction={
                <Link
                  href="/protocol-builder"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
                >
                  Open builder
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="name" label="Name" sortKey={protoSort.sortKey} sortDir={protoSort.sortDir} onSort={protoSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="version" label="Version" sortKey={protoSort.sortKey} sortDir={protoSort.sortDir} onSort={protoSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="start" label="Start" sortKey={protoSort.sortKey} sortDir={protoSort.sortDir} onSort={protoSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="status" label="Status" sortKey={protoSort.sortKey} sortDir={protoSort.sortDir} onSort={protoSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {protoSorted.map((r, i) => (
                      <tr key={r.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.version}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.start}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeStatus(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={protoSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection id="diagnostics" title="Diagnostics" actionLabel="Add diagnostic">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="category" label="Category" sortKey={diagSort.sortKey} sortDir={diagSort.sortDir} onSort={diagSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="collected" label="Collection date" sortKey={diagSort.sortKey} sortDir={diagSort.sortDir} onSort={diagSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="items" label="Items" sortKey={diagSort.sortKey} sortDir={diagSort.sortDir} onSort={diagSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="results" label="Results" sortKey={diagSort.sortKey} sortDir={diagSort.sortDir} onSort={diagSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {diagSorted.map((r, i) => (
                      <tr key={r.category} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.category}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.collected}</td>
                        <td className="px-4 py-3 text-gray-600">{r.items}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.results}</td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={diagSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection
              id="feedback"
              title="Client feedback summary"
              headerAction={
                <Link
                  href={`/members/${member.id}/feedback-summary`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
                >
                  Manage feedback summary
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="id" label="ID" sortKey={fbSort.sortKey} sortDir={fbSort.sortDir} onSort={fbSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="feedback" label="Feedback" sortKey={fbSort.sortKey} sortDir={fbSort.sortDir} onSort={fbSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="status" label="Status" sortKey={fbSort.sortKey} sortDir={fbSort.sortDir} onSort={fbSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {fbSorted.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                          <Link href={`/members/${member.id}/feedback-summary/${r.id}`} className="text-blue-600 hover:underline">
                            {r.id}
                          </Link>
                        </td>
                        <td className="max-w-md truncate px-4 py-3 text-gray-900" title={r.feedback}>
                          {r.feedback}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.status}</td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={fbSorted.length} />
            </CollapsibleSection>

            <CollapsibleSection id="documents" title="Documents / images" actionLabel="Add documents">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <SortableTh columnKey="name" label="File" sortKey={docSort.sortKey} sortDir={docSort.sortDir} onSort={docSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <SortableTh columnKey="uploaded" label="Uploaded" sortKey={docSort.sortKey} sortDir={docSort.sortDir} onSort={docSort.toggleSort} className="whitespace-nowrap px-4 py-3" detail />
                      <th className="w-12 px-4 py-3" aria-hidden />
                    </tr>
                  </thead>
                  <tbody>
                    {docSorted.map((r, i) => (
                      <tr key={r.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">{r.uploaded}</td>
                        <td className="px-4 py-3">
                          <RowActions />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TableFooter count={docSorted.length} />
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
