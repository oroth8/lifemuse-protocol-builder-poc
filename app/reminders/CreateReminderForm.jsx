"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldLabel } from "../components/FieldLabel";
import { ASSIGN_TO_OPTIONS } from "./remindersData";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300";

export function CreateReminderForm() {
  const router = useRouter();
  const [type, setType] = useState("internal");
  const [date, setDate] = useState("");
  const [repeat, setRepeat] = useState("none");
  const [assignTo, setAssignTo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    router.push("/reminders");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <FieldLabel htmlFor="rem-type">Type</FieldLabel>
          <select id="rem-type" className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="internal">Internal</option>
            <option value="external">External</option>
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="rem-date">Date</FieldLabel>
          <input id="rem-date" type="text" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} placeholder="MM/DD/YY" />
        </div>
        <div>
          <FieldLabel htmlFor="rem-repeat">Repeat</FieldLabel>
          <select id="rem-repeat" className={inputClass} value={repeat} onChange={(e) => setRepeat(e.target.value)}>
            <option value="none">Do Not Repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="rem-assign">Assign To</FieldLabel>
            <select id="rem-assign" className={inputClass} value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
              <option value="">Select member</option>
              {ASSIGN_TO_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="rem-title">Title</FieldLabel>
            <input id="rem-title" type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>
        <div className="flex min-h-[140px] flex-col lg:min-h-0">
          <FieldLabel htmlFor="rem-desc">Description</FieldLabel>
          <textarea
            id="rem-desc"
            className={`${inputClass} mt-1.5 min-h-[120px] flex-1 resize-y lg:min-h-0`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-2">
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
