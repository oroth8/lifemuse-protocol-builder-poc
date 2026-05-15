/** Shared by ProtocolBuilder and ItemFormClient — matches protocol supplement recurrence_custom shape */

export const CUSTOM_RECURRENCE_UNITS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

/** M T W T F S S — values are JavaScript weekday numbers (Sun = 0 … Sat = 6). */
export const CUSTOM_WEEKDAY_PICKER = [
  { letter: "M", day: 1 },
  { letter: "T", day: 2 },
  { letter: "W", day: 3 },
  { letter: "T", day: 4 },
  { letter: "F", day: 5 },
  { letter: "S", day: 6 },
  { letter: "S", day: 0 },
];

export function defaultRecurrenceCustom() {
  return { repeat_every: 1, repeat_unit: "week", repeat_on: [2, 4] };
}

export function normalizeRecurrenceCustom(initial) {
  if (!initial || typeof initial !== "object") return defaultRecurrenceCustom();
  const every = Math.max(1, Number(initial.repeat_every) || 1);
  const unit = CUSTOM_RECURRENCE_UNITS.some((u) => u.value === initial.repeat_unit) ? initial.repeat_unit : "week";
  const rawDays = Array.isArray(initial.repeat_on) ? initial.repeat_on : defaultRecurrenceCustom().repeat_on;
  const on = [...new Set(rawDays.map(Number).filter((d) => d >= 0 && d <= 6))].sort((a, b) => a - b);
  return { repeat_every: every, repeat_unit: unit, repeat_on: on };
}

/** Maps stored recurrence_type to select value (daily | single_occurrence | custom). */
export function recurrenceSelectValue(stored) {
  const r = stored || "daily";
  if (r === "daily") return "daily";
  if (r === "single_occurrence" || r === "one_time") return "single_occurrence";
  return "custom";
}
