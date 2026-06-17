"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { getCarePlanItemOverride, setCarePlanItemOverride } from "../lib/carePlanOverrides";

const CREDIT_START = 75000;
const SERVICE_COST = 2000;

const JAN_2026_DAYS = [
  { d: 1, avail: 6, booked: 0 },
  { d: 2, avail: 8, booked: 1 },
  { d: 3, avail: 0, booked: 2 },
  { d: 4, avail: 10, booked: 0 },
  { d: 5, avail: 4, booked: 3 },
  { d: 6, avail: 9, booked: 0 },
  { d: 7, avail: 7, booked: 1 },
  { d: 8, avail: 11, booked: 0 },
  { d: 9, avail: 5, booked: 2 },
  { d: 10, avail: 8, booked: 0 },
  { d: 11, avail: 6, booked: 0 },
  { d: 12, avail: 9, booked: 1 },
  { d: 13, avail: 7, booked: 0 },
  { d: 14, avail: 10, booked: 0 },
  { d: 15, avail: 4, booked: 4 },
  { d: 16, avail: 8, booked: 0 },
  { d: 17, avail: 6, booked: 1 },
  { d: 18, avail: 12, booked: 2 },
  { d: 19, avail: 9, booked: 0 },
  { d: 20, avail: 5, booked: 2 },
  { d: 21, avail: 8, booked: 0 },
  { d: 22, avail: 7, booked: 0 },
  { d: 23, avail: 10, booked: 1 },
  { d: 24, avail: 6, booked: 0 },
  { d: 25, avail: 4, booked: 3 },
  { d: 26, avail: 9, booked: 0 },
  { d: 27, avail: 8, booked: 1 },
  { d: 28, avail: 11, booked: 0 },
  { d: 29, avail: 7, booked: 0 },
  { d: 30, avail: 9, booked: 0 },
  { d: 31, avail: 6, booked: 1 },
];

function parseTimeLabelTo24h(label) {
  const m = String(label).trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!m) return { h: 12, min: 0 };
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return { h, min };
}

const TIME_SLOTS = [
  { id: "t1", label: "9:30 am", provider: "Dr. Stephen Smith" },
  { id: "t2", label: "9:45 am", provider: "Dr. Daniel J Aranda" },
  { id: "t3", label: "10:00 am", provider: "Dr. Stephen Smith" },
  { id: "t4", label: "10:15 am", provider: "Dr. Daniel J Aranda" },
  { id: "t5", label: "10:30 am", provider: "Dr. Stephen Smith" },
  { id: "t6", label: "10:45 am", provider: "Dr. Daniel J Aranda" },
  { id: "t7", label: "11:00 am", provider: "Dr. Stephen Smith" },
  { id: "t8", label: "11:15 am", provider: "Dr. Daniel J Aranda" },
  { id: "t9", label: "11:30 am", provider: "Dr. Stephen Smith" },
  { id: "t10", label: "11:45 am", provider: "Dr. Daniel J Aranda" },
];

function formatSelectedDateLong(year, monthIndex, day) {
  const d = new Date(year, monthIndex, day);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatDueAfterSchedule(year, monthIndex, day, timeLabel) {
  const d = new Date(year, monthIndex, day);
  const datePart = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });
  return `${datePart} - ${timeLabel}`;
}

function pillarBadgeClass(pillar) {
  const p = String(pillar || "").toLowerCase();
  if (p === "diagnostics") return "bg-orange-100 text-orange-900 ring-orange-200/80";
  if (p === "regeneration") return "bg-violet-100 text-violet-900 ring-violet-200/80";
  if (p === "recovery") return "bg-sky-100 text-sky-900 ring-sky-200/80";
  return "bg-gray-100 text-gray-800 ring-gray-200/80";
}

export function EditCarePlanItem({ member, item }) {
  const router = useRouter();
  const backHref = `/members/${member.id}/care-plan`;
  const [step, setStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  useEffect(() => {
    const o = getCarePlanItemOverride(member.id, item.id);
    if (o?.status === "scheduled") {
      router.replace(backHref);
    }
  }, [member.id, item.id, router, backHref]);

  const year = 2026;
  const monthIndex = 0;

  const selectedMeta = useMemo(() => JAN_2026_DAYS.find((x) => x.d === selectedDay), [selectedDay]);
  const selectedSlot = TIME_SLOTS.find((t) => t.id === selectedSlotId);

  const sessionSubtype = item.sessionSubtype || `${item.itemName} session`;
  const providersDetail = item.providersDetail || item.provider;
  const contextWhat = item.contextWhat || "Clinical context for this care plan item will appear here.";
  const contextExpectations = item.contextExpectations || "What the member should expect from this session.";
  const contextWhy = item.contextWhy || "Why this item is included in the member protocol.";

  function handleConfirmStep1() {
    if (!selectedDay) return;
    setStep(2);
  }

  function handleFinalConfirm() {
    if (!selectedDay || !selectedSlotId || !selectedSlot) return;
    const dueDate = formatDueAfterSchedule(year, monthIndex, selectedDay, selectedSlot.label);
    const { h, min } = parseTimeLabelTo24h(selectedSlot.label);
    const iso = new Date(year, monthIndex, selectedDay, h, min, 0, 0);
    setCarePlanItemOverride(member.id, item.id, {
      status: "scheduled",
      dueDate,
      dueAt: iso.toISOString(),
    });
    router.push(backHref);
  }

  const dateLine =
    selectedDay && selectedMeta
      ? formatSelectedDateLong(year, monthIndex, selectedDay)
      : "To be defined";
  const timeLine = step === 2 && selectedSlot ? selectedSlot.label : "To be defined";

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 pb-10 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href={backHref}
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                aria-label="Back to care plan"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Item</h1>
                <p className="text-sm text-gray-600">{item.itemName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Delete Item
              </button>
              {step === 1 ? (
                <button
                  type="button"
                  disabled={!selectedDay}
                  onClick={handleConfirmStep1}
                  className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirm
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!selectedSlotId}
                  onClick={handleFinalConfirm}
                  className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirm
                </button>
              )}
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Book Session</h2>
              {step === 1 ? (
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white">
                    Select Date
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 rounded-lg border border-sky-200 bg-sky-50 py-2.5 text-sm font-semibold text-sky-700/50"
                  >
                    Select Provider
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Select Date
                  </button>
                  <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Select Provider
                  </button>
                </div>
              )}

              {step === 1 ? (
                <>
                  <div className="mt-5 flex items-center justify-between text-sm font-medium text-gray-700">
                    <span className="text-gray-400">December</span>
                    <span className="text-base font-semibold text-gray-900">January 2026</span>
                    <span className="text-gray-400">February</span>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div key={d} className="py-2">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={`pad-${i}`} />
                    ))}
                    {JAN_2026_DAYS.map(({ d, avail, booked }) => {
                      const active = selectedDay === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDay(d)}
                          className={`flex min-h-[72px] flex-col items-center justify-start gap-1 rounded-lg border p-1.5 text-left transition-colors ${
                            active ? "border-sky-500 bg-sky-50 ring-2 ring-sky-400" : "border-gray-100 bg-gray-50/80 hover:border-gray-200"
                          }`}
                        >
                          <span className="text-xs font-semibold text-gray-900">{d}</span>
                          {avail > 0 ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                              {avail}
                            </span>
                          ) : null}
                          {booked > 0 ? (
                            <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                              {booked} booked
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-gray-500">
                    <span className="font-semibold text-gray-700">Legend:</span> green circle = available slots; black pill = other member
                    bookings on that day.
                  </p>
                </>
              ) : (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-900">
                    Available Times for {selectedDay ? formatSelectedDateLong(year, monthIndex, selectedDay) : ""}
                  </p>
                  <div className="mt-3 grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:max-h-[420px]">
                    {TIME_SLOTS.map((slot) => {
                      const on = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                            on ? "border-sky-500 bg-sky-600 font-semibold text-white" : "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
                          }`}
                        >
                          <div>{slot.label}</div>
                          <div className={on ? "text-sky-100" : "text-gray-500"}>{slot.provider}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{item.itemName}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${pillarBadgeClass(item.pillar)}`}>{item.pillar}</span>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</dt>
                  <dd className="mt-0.5 text-gray-900">{item.type}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Session / Assessment Type</dt>
                  <dd className="mt-0.5 text-gray-900">{sessionSubtype}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Provider</dt>
                  <dd className="mt-0.5 text-gray-900">{providersDetail}</dd>
                </div>
              </dl>
              <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-700">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">The What</h3>
                  <p className="mt-1 leading-relaxed">{contextWhat}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">The Expectations</h3>
                  <p className="mt-1 leading-relaxed">{contextExpectations}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">The Why</h3>
                  <p className="mt-1 leading-relaxed">{contextWhy}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Date selected</h3>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Date</dt>
                    <dd className="font-medium text-gray-900">{dateLine}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Time</dt>
                    <dd className="font-medium text-gray-900">{timeLine}</dd>
                  </div>
                </dl>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">User Balance</h2>
            <div className="mt-4 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500">Available Therapeutics Credit</p>
                <p className="mt-1 text-lg font-bold text-gray-900">${CREDIT_START.toLocaleString()}</p>
                <div className="mt-2 h-3 w-full rounded-full bg-gray-900" />
              </div>
              <div className="flex shrink-0 justify-center text-2xl text-gray-400 lg:px-4" aria-hidden>
                →→
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-red-600">Cost of services</p>
                <p className="mt-1 text-lg font-bold text-red-600">(- ${SERVICE_COST.toLocaleString()}.00)</p>
                <p className="mt-2 text-xs font-medium text-gray-500">New balance</p>
                <p className="text-lg font-bold text-gray-900">${(CREDIT_START - SERVICE_COST).toLocaleString()}</p>
                <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-l-full bg-gray-900"
                    style={{ width: `${((CREDIT_START - SERVICE_COST) / CREDIT_START) * 100}%` }}
                  />
                  <div className="h-full flex-1 bg-red-400" style={{ width: `${(SERVICE_COST / CREDIT_START) * 100}%` }} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
