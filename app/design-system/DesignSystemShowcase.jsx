"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { FieldLabel } from "../components/FieldLabel";
import { SortableTh } from "../components/SortableTh";
import { TablePagination } from "../components/TablePagination";
import { CarePlanStatusBadge } from "../members/CarePlanStatusBadge";

/** Matches `CreateReminderForm` / form fields site-wide */
const inputClass =
  "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300";

/** Compact select — `MemberDetail` table footer, `members/page.js` filters */
const selectCompactClass =
  "rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-900 focus:border-gray-300 focus:outline-none";

function Section({ id, title, children }) {
  return (
    <section id={id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-6">{children}</div>
    </section>
  );
}

function Sub({ children }) {
  return <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700">{children}</h3>;
}

function Source({ children }) {
  return <p className="text-xs text-gray-500">{children}</p>;
}

function Swatch({ hex, label, textClass = "text-white" }) {
  return (
    <div className="flex min-w-[5.5rem] flex-col gap-1">
      <div className={`h-14 w-full rounded-lg px-2 py-1.5 text-[10px] font-medium leading-tight ${textClass}`} style={{ backgroundColor: hex }}>
        {hex}
      </div>
      <span className="text-[11px] text-gray-600">{label}</span>
    </div>
  );
}

/** `SortableTh` default vs `detail` (dense uppercase) — `MemberDetail` / nested tables */
function DemoSortTable({ detail, title }) {
  const [sortKey, setSortKey] = useState("a");
  const [sortDir, setSortDir] = useState("asc");
  const toggleSort = (k) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-gray-500">{title}</p>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
              <SortableTh columnKey="a" label="Col A" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" detail={detail} />
              <SortableTh columnKey="b" label="Col B" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3" detail={detail} />
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="px-4 py-3">Row 1</td>
              <td className="px-4 py-3 text-gray-600">a</td>
            </tr>
            <tr className={detail ? "bg-gray-100" : "bg-gray-50/80"}>
              <td className="px-4 py-3">Row 2</td>
              <td className="px-4 py-3 text-gray-600">b</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DesignSystemShowcase() {
  const [page, setPage] = useState(1);

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="space-y-2">
            <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="font-medium text-gray-900">Design system</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">LIFEMUSE — component reference</h1>
            <p className="max-w-2xl text-sm text-gray-600">
              Each block mirrors classes in use today. Prefer <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">globals.css</code>{" "}
              utilities for new UI; legacy patterns are marked for eventual consolidation.
            </p>
          </header>

          <Section id="colors" title="Colors (platform)">
            <Sub>App shell & marketing surfaces</Sub>
            <div className="flex flex-wrap gap-4">
              <Swatch hex="#f4f4f4" label="Main content bg" textClass="text-gray-900 ring-1 ring-gray-200" />
              <Swatch hex="#f7f8fc" label=":root --background" textClass="text-gray-900 ring-1 ring-gray-200" />
              <Swatch hex="#1b2230" label=":root --foreground" />
              <Swatch hex="#000000" label="Sidebar (AppShell)" />
              <Swatch hex="#d4a853" label="Nav active accent" textClass="text-gray-900" />
            </div>
            <Source>AppShell sidebar <code className="text-gray-700">bg-black</code>, active link <code className="text-gray-700">#d4a853</code>.</Source>

            <Sub>Primary UI (globals + members)</Sub>
            <div className="flex flex-wrap gap-4">
              <Swatch hex="#2d2d2d" label="Primary btn / CTA" />
              <Swatch hex="#3a3a3a" label="Primary hover" />
              <Swatch hex="#5E6980" label="Field labels (FieldLabel)" />
              <Swatch hex="#9a7328" label="Gold badge text" textClass="text-white" />
            </div>
            <Source>
              <code className="text-gray-700">.btn-lifemuse-primary</code>, MemberDetail section actions <code className="text-gray-700">bg-[#2d2d2d]</code>,{" "}
              <code className="text-gray-700">FieldLabel</code> <code className="text-gray-700">#5E6980</code>.
            </Source>

            <Sub>Protocol builder (inline palette)</Sub>
            <div className="flex flex-wrap gap-4">
              <Swatch hex="#1B2230" label="tx" />
              <Swatch hex="#5E6980" label="txM" />
              <Swatch hex="#8A93A6" label="txD" />
              <Swatch hex="#D8DDEA" label="bdr" textClass="text-gray-900" />
              <Swatch hex="#5B5FED" label="acc / focus" />
            </div>
            <Source>
              <code className="text-gray-700">app/components/ProtocolBuilder.jsx</code> object <code className="text-gray-700">V</code> — not in Tailwind theme; builder-specific.
            </Source>
          </Section>

          <Section id="typography-links" title="Typography & links">
            <Sub>Headings / body</Sub>
            <p className="text-sm text-gray-600">Secondary copy uses <code className="text-xs">text-gray-600</code> or <code className="text-xs">text-gray-700</code>.</p>
            <Sub>Breadcrumb / inline links</Sub>
            <p className="text-sm">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
                Dashboard link pattern
              </Link>
            </p>
            <Source>Members, reminders, design-system breadcrumbs.</Source>
          </Section>

          <Section id="buttons" title="Buttons">
            <Sub>Canonical — app/globals.css</Sub>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-lifemuse-primary">
                Primary
              </button>
              <button type="button" className="btn-lifemuse-secondary">
                Secondary
              </button>
              <button type="button" className="btn-lifemuse-danger">
                Danger
              </button>
              <button type="button" className="btn-lifemuse-primary" disabled>
                Disabled
              </button>
            </div>
            <Source>Protocols, reminders, members list CTA, manage care plan.</Source>

            <Sub>Charcoal CTA — MemberDetail collapsible actions</Sub>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3a3a3a]"
            >
              Manage… (example)
            </button>
            <Source>Same visual family as <code className="text-gray-700">btn-lifemuse-primary</code>; used on Member profile section headers.</Source>

            <Sub>Black CTA + lift shadow — member “manage” flows</Sub>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-gray-900"
            >
              Add … (example)
            </button>
            <Source>
              <code className="text-gray-700">ManageProgressNotes</code>, <code className="text-gray-700">ManageRudiments</code>,{" "}
              <code className="text-gray-700">ManageFeedbackSummary</code>, Add* forms — prefer migrating to{" "}
              <code className="text-gray-700">btn-lifemuse-primary</code> over time.
            </Source>

            <Sub>Scheduling — Edit care plan item</Sub>
            <button type="button" className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700">
              Confirm (sky)
            </button>
            <Source>
              <code className="text-gray-700">EditCarePlanItem.jsx</code>
            </Source>

            <Sub>Bulk / secondary toolbar</Sub>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200/80"
              >
                Mark complete
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Delete selected
              </button>
            </div>
            <Source>
              <code className="text-gray-700">ManageCarePlan.jsx</code>
            </Source>

            <Sub>Outline destructive</Sub>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Delete Item
            </button>
            <Source>
              <code className="text-gray-700">EditCarePlanItem.jsx</code>
            </Source>

            <Sub>Table pagination — shared</Sub>
            <div className="flex flex-wrap gap-1">
              <button type="button" className="btn-table-page">
                &lt;
              </button>
              <button type="button" className="btn-table-page btn-table-page-active">
                1
              </button>
              <button type="button" className="btn-table-page">
                2
              </button>
            </div>
            <div className="max-w-md overflow-hidden rounded-lg border border-gray-100">
              <TablePagination currentPage={page} totalPages={3} onPageChange={setPage} ariaLabel="Demo" />
            </div>
            <Source>
              <code className="text-gray-700">TablePagination.jsx</code> — reminders, needs attention, care plan.
            </Source>

            <Sub>Legacy pagination — members manage tables</Sub>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600">
              <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 font-medium hover:bg-gray-50">
                ‹
              </button>
              <button type="button" className="min-w-8 rounded-md bg-gray-900 px-2 py-1 font-medium text-white">
                1
              </button>
              <button type="button" className="min-w-8 rounded-md border border-gray-200 bg-white px-2 py-1 font-medium text-gray-800 hover:bg-gray-50">
                2
              </button>
              <button type="button" className="rounded-md border border-gray-200 bg-white px-2 py-1 font-medium hover:bg-gray-50">
                ›
              </button>
            </div>
            <Source>
              <code className="text-gray-700">ManageProgressNotes.jsx</code> (rounded-md, not <code className="text-gray-700">btn-table-page</code>).
            </Source>

            <Sub>Icon-only row affordance</Sub>
            <button type="button" className="flex rounded p-1 hover:bg-gray-100" aria-label="Demo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <Source>Protocols, reminders, needs-attention row chevrons.</Source>
          </Section>

          <Section id="forms" title="Form controls">
            <Sub>FieldLabel</Sub>
            <div className="max-w-md">
              <FieldLabel htmlFor="ds-l">Protocol-style label</FieldLabel>
              <input id="ds-l" className={inputClass} placeholder="With htmlFor" />
            </div>
            <Source>
              <code className="text-gray-700">FieldLabel.jsx</code> — reminders create, care plan edit, protocol builder labels match <code className="text-gray-700">#5E6980</code> / uppercase / tracking.
            </Source>

            <Sub>Text input & textarea (default)</Sub>
            <div className="max-w-md space-y-3">
              <input type="text" className={inputClass} placeholder="inputClass" defaultValue="Value" />
              <textarea rows={2} className={`${inputClass} resize-y`} defaultValue="Textarea" />
            </div>
            <Source>
              <code className="text-gray-700">CreateReminderForm.jsx</code>
            </Source>

            <Sub>Search — dashboard (pill)</Sub>
            <input
              type="search"
              placeholder="Search"
              className="w-full max-w-md rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-gray-300 focus:bg-white"
            />
            <Source>
              <code className="text-gray-700">dashboard/page.js</code> header.
            </Source>

            <Sub>Search — lists (rounded-lg + icon)</Sub>
            <div className="relative max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
              />
            </div>
            <Source>
              <code className="text-gray-700">members/page.js</code>, <code className="text-gray-700">ManageCarePlan.jsx</code>, manage* tables.
            </Source>

            <Sub>Select — full width (form fields)</Sub>
            <select className={inputClass} defaultValue="b">
              <option value="a">A</option>
              <option value="b">B</option>
            </select>
            <Source>
              <code className="text-gray-700">CreateReminderForm.jsx</code>
            </Source>

            <Sub>Select — compact (toolbar / footer)</Sub>
            <select className={selectCompactClass} defaultValue="12">
              <option value="12">12</option>
              <option value="24">24</option>
            </select>
            <Source>
              <code className="text-gray-700">MemberDetail.jsx</code> per-page, <code className="text-gray-700">members/page.js</code>.
            </Source>
          </Section>

          <Section id="status" title="Status & pills">
            <Sub>Care plan item (Manage care plan)</Sub>
            <div className="flex flex-wrap gap-3">
              <CarePlanStatusBadge status="unscheduled" />
              <CarePlanStatusBadge status="overdue" />
              <CarePlanStatusBadge status="scheduled" />
              <CarePlanStatusBadge status="completed" />
            </div>
            <Source>
              <code className="text-gray-700">CarePlanStatusBadge.jsx</code>
            </Source>

            <Sub>Dashboard — needs attention (approved vs awaiting)</Sub>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                Approved
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
                Awaiting Approval
              </span>
            </div>
            <Source>
              <code className="text-gray-700">NeedsAttentionTable.jsx</code>
            </Source>

            <Sub>Member profile — protocol / rudiment row status (badgeStatus)</Sub>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Completed</span>
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800">Scheduled</span>
              <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">Default</span>
            </div>
            <Source>
              <code className="text-gray-700">MemberDetail.jsx</code> <code className="text-gray-700">badgeStatus()</code>
            </Source>

            <Sub>Protocols table — status chip</Sub>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">Active</span>
            <Source>
              <code className="text-gray-700">ProtocolsTable.jsx</code>
            </Source>

            <Sub>Progress notes — draft / published</Sub>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">Draft</span>
              <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">Published</span>
            </div>
            <Source>
              <code className="text-gray-700">MemberDetail.jsx</code> <code className="text-gray-700">NoteStatusPill</code>
            </Source>

            <Sub>Member type badge (gold)</Sub>
            <span className="inline-flex rounded-md border border-[#d4a853]/40 bg-[#d4a853]/12 px-2.5 py-0.5 text-xs font-semibold capitalize text-[#9a7328]">dependent</span>
            <Source>
              <code className="text-gray-700">MemberDetail.jsx</code> profile grid.
            </Source>
          </Section>

          <Section id="tables" title="Tables">
            <div className="grid gap-6 md:grid-cols-2">
              <DemoSortTable detail={false} title="SortableTh — default (protocols / reminders / lists)" />
              <DemoSortTable detail title="SortableTh — detail (MemberDetail nested tables)" />
            </div>
            <Source>
              <code className="text-gray-700">SortableTh.jsx</code> <code className="text-gray-700">detail</code> prop toggles header density.
            </Source>

            <Sub>Row striping variants</Sub>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-2">Protocols / reminders</td>
                    <td className="px-4 py-2 text-gray-600">
                      <code className="text-xs">bg-white</code> / <code className="text-xs">bg-gray-100</code>
                    </td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="px-4 py-2">Even row</td>
                    <td className="px-4 py-2 text-gray-600">ProtocolsTable pattern</td>
                  </tr>
                  <tr className="bg-gray-50/80">
                    <td className="px-4 py-2">Manage care plan</td>
                    <td className="px-4 py-2 text-gray-600">
                      <code className="text-xs">bg-gray-50/80</code> alternating
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="cards" title="Cards & shells">
            <Sub>Protocols / dashboard sections</Sub>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <code className="text-xs text-gray-700">rounded-2xl border border-gray-100 bg-white shadow-sm</code>
            </div>
            <Source>Dashboard sections, protocols page wrapper.</Source>

            <Sub>Member profile — collapsible sections</Sub>
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <code className="text-xs text-gray-700">rounded-xl border border-gray-200/80 … shadow-[0_1px_3px_rgba(0,0,0,0.04)]</code>
            </div>
            <Source>
              <code className="text-gray-700">MemberDetail.jsx</code> <code className="text-gray-700">CollapsibleSection</code>
            </Source>

            <Sub>Members manage — outer section</Sub>
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
              <code className="text-xs text-gray-700">rounded-xl border border-gray-200/80 bg-white shadow-sm</code>
            </div>
            <Source>ManageProgressNotes, ManageRudiments, etc.</Source>

            <Sub>Rich text container</Sub>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-600">
              <code className="text-xs">RichTextEditor.jsx</code> shell — <code className="text-xs">rounded-lg border border-gray-200 bg-white</code>
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
