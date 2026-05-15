"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { SortableTh } from "../components/SortableTh";
import { useTableSort } from "../hooks/useTableSort";
import { parseDateish, sortRows } from "../lib/tableSort";
import { ReminderImportanceBadge } from "../reminders/ReminderImportanceBadge";

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const SORT_KEYS = ["id", "date", "from", "importance", "title", "description"];

const IMPORTANCE_SORT = { high: 3, medium: 2, low: 1 };

const HEADER_LABEL = {
  id: "ID",
  date: "Date",
  from: "From",
  importance: "Importance",
  title: "Title",
  description: "Description",
};

function reminderValue(row, key) {
  if (key === "date") return parseDateish(row.date);
  if (key === "id") {
    const n = parseInt(row.id.replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? row.id : n;
  }
  if (key === "importance") {
    const k = String(row.importance ?? "Medium").toLowerCase();
    return IMPORTANCE_SORT[k] ?? 0;
  }
  return String(row[key] ?? "").toLowerCase();
}

function reminderDetailHref(row) {
  const target = row.reminderId ?? row.id;
  return target ? `/reminders/${encodeURIComponent(String(target))}` : null;
}

export function ReminderNotificationsTable({ rows }) {
  const router = useRouter();
  const { sortKey, sortDir, toggleSort } = useTableSort("date", "desc");
  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir, reminderValue), [rows, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
            {SORT_KEYS.map((key) => (
              <SortableTh
                key={key}
                columnKey={key}
                label={HEADER_LABEL[key]}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
                className="px-6 py-3"
              />
            ))}
            <th className="w-12 px-6 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const href = reminderDetailHref(row);
            return (
              <tr
                key={row.id}
                role={href ? "link" : undefined}
                tabIndex={href ? 0 : undefined}
                aria-label={href ? `Open reminder: ${row.title}` : undefined}
                className={`${i % 2 === 0 ? "bg-white" : "bg-gray-100"} ${href ? "cursor-pointer hover:bg-gray-200/70" : ""}`}
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
                <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">{row.id}</td>
                <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.date}</td>
                <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.from}</td>
                <td className="whitespace-nowrap px-6 py-3.5">
                  <ReminderImportanceBadge level={row.importance} />
                </td>
                <td className="px-6 py-3.5 text-gray-900">{row.title}</td>
                <td className="max-w-xs truncate px-6 py-3.5 text-gray-600">{row.description}</td>
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
  );
}
