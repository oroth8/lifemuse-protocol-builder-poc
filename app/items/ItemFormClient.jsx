"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PILLAR_META, PILLAR_TAG_ORDER } from "../categories/categoriesData";
import { CustomRecurrenceModal } from "../components/CustomRecurrenceModal";
import { FieldLabel } from "../components/FieldLabel";
import { DEFAULT_SUPPLEMENT_ICON_ID, SupplementIconGlyph, SupplementIconPickerModal } from "../components/protocolSupplementIcons";
import { normalizeRecurrenceCustom, recurrenceSelectValue } from "../lib/customRecurrence";
import {
  CONCIERGE_REMINDER_ORDER,
  EMPTY_ITEM_FORM_VALUES,
  ITEM_TYPE_META,
  ITEM_TYPE_ORDER,
  RECURRENCE_META,
  RECURRENCE_ORDER,
  RECOVERY_SESSION_CATEGORY_META,
  RECOVERY_SESSION_CATEGORY_ORDER,
  REGENERATION_SESSION_CATEGORY_META,
  REGENERATION_SESSION_CATEGORY_ORDER,
  SESSION_TYPE_META,
  SESSION_TYPE_ORDER,
  SUPPLEMENT_RECURRENCE_META,
  SUPPLEMENT_RECURRENCE_ORDER,
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

/** Same chevron semantics as ProtocolBuilder `CollapseChevron` */
function CollapseChevronSmall({ expanded }) {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-gray-400" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="block" xmlns="http://www.w3.org/2000/svg">
        {expanded ? (
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
          />
        )}
      </svg>
    </span>
  );
}

function ItemContextFieldsCollapsible({ children }) {
  const [open, setOpen] = useState(true);
  const uid = useId();
  const panelId = `${uid}-item-ctx`;
  const labelId = `${uid}-item-ctx-label`;
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5">
      <button
        type="button"
        id={labelId}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent p-0 text-left"
        style={{ font: "inherit" }}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#5E6980]">Context fields</span>
        <CollapseChevronSmall expanded={open} />
      </button>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={labelId} className="mt-4 space-y-4">
          {children}
        </div>
      ) : null}
    </div>
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
  const [supplementRecurrenceModalOpen, setSupplementRecurrenceModalOpen] = useState(false);
  const supplementRecurrenceSnapshotRef = useRef(null);

  const pillarLabel = PILLAR_META[form.pillarKey]?.label ?? PILLAR_META.nutrition.label;
  const pillarHex = PILLAR_ACCENT_HEX[form.pillarKey] ?? PILLAR_ACCENT_HEX.nutrition;
  const isSupplementsPillar = form.pillarKey === "supplements";
  const isRecoveryPillar = form.pillarKey === "recovery";
  const isRegenerationPillar = form.pillarKey === "regeneration";

  useEffect(() => {
    if (form.pillarKey !== "supplements") return;
    if (form.itemTypeKey === "session" || form.itemTypeKey === "task") {
      setForm((prev) => ({ ...prev, itemTypeKey: "system_formula" }));
    }
  }, [form.pillarKey, form.itemTypeKey]);

  const itemTypeSelectKeys = useMemo(() => {
    if (form.itemTypeKey === "session" || form.itemTypeKey === "task") return ["session", "task"];
    return ITEM_TYPE_ORDER;
  }, [form.itemTypeKey]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSupplementRecurrenceSelect(e) {
    const v = e.target.value;
    if (v === "custom") {
      supplementRecurrenceSnapshotRef.current = {
        supplementRecurrenceType: form.supplementRecurrenceType,
        supplementRecurrenceCustom: form.supplementRecurrenceCustom,
      };
      setForm((prev) => ({ ...prev, supplementRecurrenceType: "custom" }));
      setSupplementRecurrenceModalOpen(true);
    } else {
      setForm((prev) => ({
        ...prev,
        supplementRecurrenceType: v,
        supplementRecurrenceCustom: null,
      }));
    }
  }

  function handleSupplementCustomDone(custom) {
    setForm((prev) => ({ ...prev, supplementRecurrenceCustom: custom }));
    setSupplementRecurrenceModalOpen(false);
    supplementRecurrenceSnapshotRef.current = null;
  }

  function handleSupplementCustomCancel() {
    setSupplementRecurrenceModalOpen(false);
    const snap = supplementRecurrenceSnapshotRef.current;
    if (snap) {
      setForm((prev) => ({
        ...prev,
        supplementRecurrenceType: snap.supplementRecurrenceType,
        supplementRecurrenceCustom: snap.supplementRecurrenceCustom,
      }));
      supplementRecurrenceSnapshotRef.current = null;
    }
  }

  function saveDraft() {
    router.push("/items");
  }

  function saveItem() {
    const isSup = form.pillarKey === "supplements";
    const safeType = isSup
      ? form.itemTypeKey === "compound" || form.itemTypeKey === "system_formula"
        ? form.itemTypeKey
        : "system_formula"
      : ITEM_TYPE_META[form.itemTypeKey]
        ? form.itemTypeKey
        : "task";
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

    if (form.pillarKey === "recovery") {
      row.recovery_session_category = form.recoverySessionCategory;
    }
    if (form.pillarKey === "regeneration") {
      row.regeneration_session_category = form.regenerationSessionCategory;
    }

    if (isSup) {
      row.dosage = typeof form.dosage === "string" ? form.dosage : "";
      row.route = typeof form.route === "string" ? form.route : "";
      row.recurrence_type = form.supplementRecurrenceType;
      row.start_date = form.supplementStartDate;
      row.end_date = form.supplementEndDate;
      row.anchor_time = form.supplementAnchorTime;
      if (form.supplementRecurrenceType === "custom") {
        row.recurrence_custom = normalizeRecurrenceCustom(form.supplementRecurrenceCustom);
      }
    }

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
  const showSessionTaskChrome = (isSession || isTask) && !isSupplementsPillar;
  const showLegacyTypePillar = !isSession && !isTask && !isSupplementsPillar;

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
            {mode === "create" ? (
              <p className="mt-0.5 text-xs leading-snug">
                <span className="font-medium text-[#5E6980]">Pillar — </span>
                <span className="font-semibold" style={{ color: pillarHex }}>
                  {pillarLabel}
                </span>
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-medium" style={{ color: pillarHex }}>
                {pillarLabel}
              </p>
            )}
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
                  placeholder={isSupplementsPillar ? "Supplement name" : "e.g. Drink Water"}
                  aria-label="Item name"
                />
              </div>
            </div>

            {isSupplementsPillar ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="dosage" className="font-bold uppercase">
                      Dosage
                    </FieldLabel>
                    <input
                      id="dosage"
                      type="text"
                      value={form.dosage}
                      onChange={(e) => setField("dosage", e.target.value)}
                      className={`${controlClass} mt-1.5`}
                      placeholder="e.g. 1 scoop"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="route" className="font-bold uppercase">
                      Route
                    </FieldLabel>
                    <input
                      id="route"
                      type="text"
                      value={form.route}
                      onChange={(e) => setField("route", e.target.value)}
                      className={`${controlClass} mt-1.5`}
                      placeholder="e.g. oral"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch *:min-h-0">
                  <ScheduleField id="supp-recurrence" label="Recurrence">
                    <select
                      id="supp-recurrence"
                      value={recurrenceSelectValue(form.supplementRecurrenceType)}
                      onChange={handleSupplementRecurrenceSelect}
                      className={compactControlClass}
                    >
                      {SUPPLEMENT_RECURRENCE_ORDER.map((key) => (
                        <option key={key} value={key}>
                          {SUPPLEMENT_RECURRENCE_META[key].label}
                        </option>
                      ))}
                    </select>
                  </ScheduleField>
                  <ScheduleField id="supp-start-date" label="Starting at">
                    <input
                      id="supp-start-date"
                      type="date"
                      value={form.supplementStartDate}
                      onChange={(e) => setField("supplementStartDate", e.target.value)}
                      className={compactControlClass}
                    />
                  </ScheduleField>
                  <ScheduleField id="supp-end-date" label="Ending on">
                    <input
                      id="supp-end-date"
                      type="date"
                      value={form.supplementEndDate}
                      onChange={(e) => setField("supplementEndDate", e.target.value)}
                      className={compactControlClass}
                    />
                  </ScheduleField>
                  <ScheduleField id="supp-anchor-time" label="Time">
                    <input
                      id="supp-anchor-time"
                      type="time"
                      value={form.supplementAnchorTime}
                      onChange={(e) => setField("supplementAnchorTime", e.target.value)}
                      className={compactControlClass}
                    />
                  </ScheduleField>
                </div>
              </>
            ) : null}

            {showSessionTaskChrome ? (
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
                    {isRecoveryPillar ? (
                      <select
                        id="session-type"
                        value={form.recoverySessionCategory}
                        onChange={(e) => setField("recoverySessionCategory", e.target.value)}
                        className={`${controlClass} mt-1.5`}
                      >
                        {RECOVERY_SESSION_CATEGORY_ORDER.map((key) => (
                          <option key={key} value={key}>
                            {RECOVERY_SESSION_CATEGORY_META[key].label}
                          </option>
                        ))}
                      </select>
                    ) : isRegenerationPillar ? (
                      <select
                        id="session-type"
                        value={form.regenerationSessionCategory}
                        onChange={(e) => setField("regenerationSessionCategory", e.target.value)}
                        className={`${controlClass} mt-1.5`}
                      >
                        {REGENERATION_SESSION_CATEGORY_ORDER.map((key) => (
                          <option key={key} value={key}>
                            {REGENERATION_SESSION_CATEGORY_META[key].label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select id="session-type" value={form.sessionTypeKey} onChange={(e) => setField("sessionTypeKey", e.target.value)} className={`${controlClass} mt-1.5`}>
                        {SESSION_TYPE_ORDER.map((key) => (
                          <option key={key} value={key}>
                            {SESSION_TYPE_META[key].label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            {isSession && showSessionTaskChrome ? (
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

            {isTask && showSessionTaskChrome ? (
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

            {showLegacyTypePillar ? (
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

            <ItemContextFieldsCollapsible>
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
            </ItemContextFieldsCollapsible>
          </div>
        </section>
        </div>
      </div>
      {isSupplementsPillar && supplementRecurrenceModalOpen ? (
        <CustomRecurrenceModal
          initial={form.supplementRecurrenceCustom}
          onDone={handleSupplementCustomDone}
          onCancel={handleSupplementCustomCancel}
        />
      ) : null}
    </div>
  );
}
