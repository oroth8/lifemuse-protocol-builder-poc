"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CustomRecurrenceModal } from "../components/CustomRecurrenceModal";
import { FieldLabel } from "../components/FieldLabel";
import { normalizeRecurrenceCustom, recurrenceSelectValue } from "../lib/customRecurrence";
import { SUPPLEMENT_RECURRENCE_META, SUPPLEMENT_RECURRENCE_ORDER } from "../items/itemsData";
import { ASSIGN_TO_OPTIONS } from "./remindersData";

const controlClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300";

const selectClass =
  "w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 outline-none focus:border-gray-300";

/** Same as `ItemFormClient` schedule row — date/time match items & protocol builder time fields */
const scheduleCompactClass =
  "box-border h-10 min-h-10 w-full max-h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 py-0 text-sm leading-none text-gray-900 outline-none focus:border-gray-300 focus:bg-white [color-scheme:light]";

const recurrenceSelectClass =
  "box-border h-10 min-h-10 w-full max-h-10 appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-0 pr-10 text-sm leading-none text-gray-900 outline-none focus:border-gray-300 focus:bg-white";

function IconChevronDown({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SelectField({ id, label, value, onChange, children }) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative mt-1.5">
        <select id={id} className={selectClass} value={value} onChange={onChange}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <IconChevronDown />
        </span>
      </div>
    </div>
  );
}

export function CreateReminderForm() {
  const router = useRouter();
  const recurrenceSnapshotRef = useRef(null);

  const [type, setType] = useState("internal");
  const [assignTo, setAssignTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminderRecurrenceType, setReminderRecurrenceType] = useState("single_occurrence");
  const [reminderRecurrenceCustom, setReminderRecurrenceCustom] = useState(null);
  const [recurrenceModalOpen, setRecurrenceModalOpen] = useState(false);
  const [importance, setImportance] = useState("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const recurrenceSelectDisplay = recurrenceSelectValue(reminderRecurrenceType);

  function handleRecurrenceSelect(e) {
    const v = e.target.value;
    if (v === "custom") {
      recurrenceSnapshotRef.current = {
        reminderRecurrenceType,
        reminderRecurrenceCustom,
      };
      setReminderRecurrenceType("custom");
      setRecurrenceModalOpen(true);
    } else {
      setReminderRecurrenceType(v);
      setReminderRecurrenceCustom(null);
    }
  }

  function handleRecurrenceModalDone(custom) {
    setReminderRecurrenceCustom(normalizeRecurrenceCustom(custom));
    setRecurrenceModalOpen(false);
    recurrenceSnapshotRef.current = null;
  }

  function handleRecurrenceModalCancel() {
    setRecurrenceModalOpen(false);
    const snap = recurrenceSnapshotRef.current;
    if (snap) {
      setReminderRecurrenceType(snap.reminderRecurrenceType);
      setReminderRecurrenceCustom(snap.reminderRecurrenceCustom);
      recurrenceSnapshotRef.current = null;
    }
  }

  function openEditCustomRecurrence() {
    recurrenceSnapshotRef.current = {
      reminderRecurrenceType,
      reminderRecurrenceCustom,
    };
    setRecurrenceModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    router.push("/reminders");
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-5">
            <SelectField id="rem-type" label="Type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="internal">Internal</option>
              <option value="member">Member</option>
              <option value="myself">Myself</option>
            </SelectField>

            <SelectField id="rem-assign" label="Assign To" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
              <option value="">Select member</option>
              {ASSIGN_TO_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </SelectField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div>
                <FieldLabel htmlFor="rem-date">Date</FieldLabel>
                <input id="rem-date" type="date" className={`${scheduleCompactClass} mt-1.5`} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <FieldLabel htmlFor="rem-time">Time</FieldLabel>
                <input id="rem-time" type="time" className={`${scheduleCompactClass} mt-1.5`} value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div>
                <FieldLabel htmlFor="rem-recurrence">Recurrence</FieldLabel>
                <div className="relative mt-1.5">
                  <select
                    id="rem-recurrence"
                    className={recurrenceSelectClass}
                    value={recurrenceSelectDisplay}
                    onChange={handleRecurrenceSelect}
                  >
                    {SUPPLEMENT_RECURRENCE_ORDER.map((key) => (
                      <option key={key} value={key}>
                        {SUPPLEMENT_RECURRENCE_META[key].label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <IconChevronDown />
                  </span>
                </div>
                {recurrenceSelectDisplay === "custom" ? (
                  <button
                    type="button"
                    className="mt-2 text-left text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={openEditCustomRecurrence}
                  >
                    Edit custom pattern
                  </button>
                ) : null}
                {recurrenceModalOpen ? (
                  <CustomRecurrenceModal
                    initial={reminderRecurrenceCustom}
                    onDone={handleRecurrenceModalDone}
                    onCancel={handleRecurrenceModalCancel}
                  />
                ) : null}
              </div>

              <SelectField id="rem-importance" label="Importance" value={importance} onChange={(e) => setImportance(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </SelectField>
            </div>
          </div>

          <div className="flex min-h-[280px] flex-col gap-5 lg:min-h-[22rem]">
            <div>
              <FieldLabel htmlFor="rem-title">Title</FieldLabel>
              <input id="rem-title" type="text" className={`${controlClass} mt-1.5`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <FieldLabel htmlFor="rem-desc">Description</FieldLabel>
              <textarea
                id="rem-desc"
                className={`${controlClass} mt-1.5 min-h-[12rem] flex-1 resize-y lg:min-h-0`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4 sm:px-8">
        <button type="button" className="btn-lifemuse-secondary" onClick={() => router.push("/reminders")}>
          Cancel
        </button>
        <button type="submit" className="btn-lifemuse-primary">
          Create
        </button>
      </div>
    </form>
  );
}
