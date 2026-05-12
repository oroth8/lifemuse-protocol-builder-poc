"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PILLAR_META, PILLAR_TAG_ORDER } from "../categories/categoriesData";
import { FieldLabel } from "../components/FieldLabel";
import { DEFAULT_SUPPLEMENT_ICON_ID, SupplementIconGlyph, SupplementIconPickerModal } from "../components/protocolSupplementIcons";
import {
  CONCIERGE_REMINDER_ORDER,
  EMPTY_ITEM_FORM_VALUES,
  ITEM_TYPE_META,
  ITEM_TYPE_ORDER,
  RECURRENCE_META,
  RECURRENCE_ORDER,
  SESSION_TYPE_META,
  SESSION_TYPE_ORDER,
} from "./itemsData";

const PENDING_KEY = "lm_items_pending";

/** Pillar label color under title (matches pillar chip label hex). */
const PILLAR_ACCENT_HEX = {
  supplements: "#1D9E75",
  nutrition: "#1D9E75",
  training: "#D85A30",
  recovery: "#D4537E",
  diagnostics: "#D40511",
  regeneration: "#378ADD",
};

const controlClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white";

/** Schedule row controls: fixed height, no py-2 (avoids select vs input misalignment) */
const compactControlClass =
  "box-border h-10 min-h-10 w-full max-h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 py-0 text-sm leading-none text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white";

function IconChevronLeft({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IconInfo({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16v-5M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** One column in session/task schedule rows; on lg, controls share one baseline across the row */
function ScheduleField({ id, label, infoTitle, children }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-1 lg:h-full lg:gap-0">
      <div className="flex shrink-0 flex-wrap items-center gap-x-1.5">
        <FieldLabel htmlFor={id} className="font-bold uppercase">
          {label}
        </FieldLabel>
        {infoTitle ? (
          <span className="shrink-0 text-gray-400" title={infoTitle}>
            <IconInfo className="inline" />
          </span>
        ) : null}
      </div>
      <div className="hidden min-h-0 flex-1 lg:block" aria-hidden />
      <div className="shrink-0 lg:mt-auto">{children}</div>
    </div>
  );
}

/**
 * @param {{
 *   mode: "create" | "edit",
 *   itemId?: number,
 *   initialValues?: Partial<typeof EMPTY_ITEM_FORM_VALUES>,
 * }} props
 */
export function ItemFormClient({ mode, itemId, initialValues = {} }) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({ ...EMPTY_ITEM_FORM_VALUES, ...initialValues }));
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const pillarLabel = PILLAR_META[form.pillarKey]?.label ?? PILLAR_META.nutrition.label;
  const pillarHex = PILLAR_ACCENT_HEX[form.pillarKey] ?? PILLAR_ACCENT_HEX.nutrition;

  const itemTypeSelectKeys = useMemo(() => {
    if (form.itemTypeKey === "session" || form.itemTypeKey === "task") return ["session", "task"];
    return ITEM_TYPE_ORDER;
  }, [form.itemTypeKey]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function saveDraft() {
    router.push("/items");
  }

  function saveItem() {
    const safeType = ITEM_TYPE_META[form.itemTypeKey] ? form.itemTypeKey : "task";
    const itemName = form.itemName.trim() || "Untitled item";
    const row = {
      id: mode === "create" ? Date.now() : itemId,
      itemName,
      itemTypeKey: safeType,
      pillarKey: form.pillarKey,
      sessionTypeKey: form.sessionTypeKey,
      recurrence: form.recurrence,
      dayBegins: form.dayBegins,
      dayEnds: form.dayEnds,
      conciergeReminder: form.conciergeReminder,
      taskTime: form.taskTime,
      instructions: form.instructions,
      contextWhat: form.contextWhat,
      contextExpectations: form.contextExpectations,
      contextWhy: form.contextWhy,
      icon_id: form.icon_id || DEFAULT_SUPPLEMENT_ICON_ID,
    };

    const payload = mode === "create" ? { op: "create", row } : { op: "update", row };
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
    router.push("/items?added=1");
  }

  const title = mode === "create" ? "Create Item" : "Edit Item";

  const isSession = form.itemTypeKey === "session";
  const isTask = form.itemTypeKey === "task";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-50 flex w-full shrink-0 items-center justify-between gap-4 border-b border-[#D8DDEA] bg-white px-4 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/items"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D8DDEA] bg-white text-[#5E6980] no-underline transition-colors hover:bg-[#F3F5FB]"
            aria-label="Back to items"
          >
            <IconChevronLeft className="block" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight text-[#1B2230]">{title}</h1>
            <p className="mt-0.5 text-xs font-medium" style={{ color: pillarHex }}>
              {pillarLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex items-center justify-center rounded-lg border border-[#D8DDEA] bg-transparent px-[18px] py-2 text-[13px] font-medium text-[#5E6980] transition-colors hover:bg-[#F3F5FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B5FED]"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={saveItem}
            className="inline-flex items-center justify-center rounded-lg border-0 bg-[#5B5FED] px-[18px] py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B5FED]"
          >
            Save Item
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-[#f4f4f4] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="space-y-6 p-5 sm:p-6">
            <div className="flex gap-3">
              <button
                type="button"
                aria-label="Choose item icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIconPickerOpen(true);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-0 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <SupplementIconGlyph id={form.icon_id || DEFAULT_SUPPLEMENT_ICON_ID} size={22} />
              </button>
              {iconPickerOpen ? (
                <SupplementIconPickerModal
                  value={form.icon_id || DEFAULT_SUPPLEMENT_ICON_ID}
                  onChange={(id) => setField("icon_id", id)}
                  onClose={() => setIconPickerOpen(false)}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <input
                  id="item-name"
                  type="text"
                  value={form.itemName}
                  onChange={(e) => setField("itemName", e.target.value)}
                  className={`${controlClass} mt-0`}
                  placeholder="e.g. Drink Water"
                  aria-label="Item name"
                />
              </div>
            </div>

            {(isSession || isTask) ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <FieldLabel htmlFor="item-type-main" className="font-bold uppercase">
                    Item type
                  </FieldLabel>
                  <select
                    id="item-type-main"
                    value={form.itemTypeKey}
                    onChange={(e) => setField("itemTypeKey", e.target.value)}
                    className={`${controlClass} mt-1.5`}
                  >
                    {itemTypeSelectKeys.map((key) => (
                      <option key={key} value={key}>
                        {ITEM_TYPE_META[key].label}
                      </option>
                    ))}
                  </select>
                </div>
                {form.itemTypeKey === "session" ? (
                  <div>
                    <FieldLabel htmlFor="session-type" className="font-bold uppercase">
                      Session type
                    </FieldLabel>
                    <select id="session-type" value={form.sessionTypeKey} onChange={(e) => setField("sessionTypeKey", e.target.value)} className={`${controlClass} mt-1.5`}>
                      {SESSION_TYPE_ORDER.map((key) => (
                        <option key={key} value={key}>
                          {SESSION_TYPE_META[key].label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            ) : null}

            {isSession ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch *:min-h-0">
                <ScheduleField id="recurrence-s" label="Recurrence">
                  <select id="recurrence-s" value={form.recurrence} onChange={(e) => setField("recurrence", e.target.value)} className={compactControlClass}>
                    {RECURRENCE_ORDER.map((key) => (
                      <option key={key} value={key}>
                        {RECURRENCE_META[key].label}
                      </option>
                    ))}
                  </select>
                </ScheduleField>
                <ScheduleField id="day-begins-s" label="Day item begins" infoTitle="First protocol day this item applies">
                  <input id="day-begins-s" type="text" inputMode="numeric" value={form.dayBegins} onChange={(e) => setField("dayBegins", e.target.value)} className={`${compactControlClass} tabular-nums`} />
                </ScheduleField>
                <ScheduleField id="day-ends-s" label="Day item ends" infoTitle="Last protocol day this item applies">
                  <input id="day-ends-s" type="text" inputMode="numeric" value={form.dayEnds} onChange={(e) => setField("dayEnds", e.target.value)} className={`${compactControlClass} tabular-nums`} />
                </ScheduleField>
                <ScheduleField id="concierge" label="Concierge reminder">
                  <select id="concierge" value={form.conciergeReminder} onChange={(e) => setField("conciergeReminder", e.target.value)} className={compactControlClass}>
                    {CONCIERGE_REMINDER_ORDER.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </ScheduleField>
              </div>
            ) : null}

            {isTask ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch *:min-h-0">
                <ScheduleField id="recurrence-t" label="Recurrence">
                  <select id="recurrence-t" value={form.recurrence} onChange={(e) => setField("recurrence", e.target.value)} className={compactControlClass}>
                    {RECURRENCE_ORDER.map((key) => (
                      <option key={key} value={key}>
                        {RECURRENCE_META[key].label}
                      </option>
                    ))}
                  </select>
                </ScheduleField>
                <ScheduleField id="day-begins-t" label="Day item begins" infoTitle="First protocol day this item applies">
                  <input id="day-begins-t" type="text" inputMode="numeric" value={form.dayBegins} onChange={(e) => setField("dayBegins", e.target.value)} className={`${compactControlClass} tabular-nums`} />
                </ScheduleField>
                <ScheduleField id="day-ends-t" label="Day item ends" infoTitle="Last protocol day this item applies">
                  <input id="day-ends-t" type="text" inputMode="numeric" value={form.dayEnds} onChange={(e) => setField("dayEnds", e.target.value)} className={`${compactControlClass} tabular-nums`} />
                </ScheduleField>
                <ScheduleField id="task-time" label="Time">
                  <input id="task-time" type="text" value={form.taskTime} onChange={(e) => setField("taskTime", e.target.value)} className={compactControlClass} placeholder="e.g. 2 PM" />
                </ScheduleField>
              </div>
            ) : null}

            {!isSession && !isTask ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <FieldLabel htmlFor="item-type-legacy" className="font-bold uppercase">
                    Item type
                  </FieldLabel>
                  <select id="item-type-legacy" value={form.itemTypeKey} onChange={(e) => setField("itemTypeKey", e.target.value)} className={`${controlClass} mt-1.5`}>
                    {itemTypeSelectKeys.map((key) => (
                      <option key={key} value={key}>
                        {ITEM_TYPE_META[key].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="pillar-legacy" className="font-bold uppercase">
                    Pillar
                  </FieldLabel>
                  <select id="pillar-legacy" value={form.pillarKey} onChange={(e) => setField("pillarKey", e.target.value)} className={`${controlClass} mt-1.5`}>
                    {PILLAR_TAG_ORDER.map((key) => (
                      <option key={key} value={key}>
                        {PILLAR_META[key].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            <div>
              <FieldLabel htmlFor="instructions" className="font-bold uppercase">
                Instructions
              </FieldLabel>
              <textarea
                id="instructions"
                rows={4}
                value={form.instructions}
                onChange={(e) => setField("instructions", e.target.value)}
                className={`${controlClass} mt-1.5 min-h-[100px] resize-y`}
                placeholder="e.g. Eat avocado toast"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#5E6980]">Context fields</p>
              <div className="mt-4 space-y-4">
                <div>
                  <FieldLabel htmlFor="ctx-what" className="font-bold uppercase">
                    The what
                  </FieldLabel>
                  <textarea
                    id="ctx-what"
                    rows={3}
                    value={form.contextWhat}
                    onChange={(e) => setField("contextWhat", e.target.value)}
                    placeholder="What is this item? Describe it clearly and concisely."
                    className={`${controlClass} mt-1.5 resize-y`}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="ctx-exp" className="font-bold uppercase">
                    The expectations
                  </FieldLabel>
                  <textarea
                    id="ctx-exp"
                    rows={3}
                    value={form.contextExpectations}
                    onChange={(e) => setField("contextExpectations", e.target.value)}
                    placeholder="What outcomes or results should the patient expect from this?"
                    className={`${controlClass} mt-1.5 resize-y`}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="ctx-why" className="font-bold uppercase">
                    The why
                  </FieldLabel>
                  <textarea
                    id="ctx-why"
                    rows={3}
                    value={form.contextWhy}
                    onChange={(e) => setField("contextWhy", e.target.value)}
                    placeholder="Why is this included in the protocol? What's the clinical rationale?"
                    className={`${controlClass} mt-1.5 resize-y`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
