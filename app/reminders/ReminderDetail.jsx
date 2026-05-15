"use client";

import { useRouter } from "next/navigation";
import { FieldLabel } from "../components/FieldLabel";
import { ReminderImportanceBadge } from "./ReminderImportanceBadge";

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export function ReminderDetail({ reminder }) {
  const router = useRouter();

  const rows = [
    { label: "ID", value: reminder.id },
    { label: "DATE", value: reminder.displayDate },
    { label: "ASSIGN TO", value: reminder.to },
    {
      label: "IMPORTANCE",
      value: <ReminderImportanceBadge level={reminder.importance} />,
    },
    { label: "TITLE", value: reminder.title },
    { label: "DESCRIPTION", value: reminder.description },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Reminder #{reminder.id}</h1>
        <button type="button" onClick={() => router.push("/reminders")} className="btn-lifemuse-danger">
          <IconTrash />
          Delete Reminder
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <dl className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 px-6 py-4 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:items-start sm:gap-8">
              <dt>
                <FieldLabel>{row.label}</FieldLabel>
              </dt>
              <dd className="text-sm text-gray-900 sm:pt-0.5">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
