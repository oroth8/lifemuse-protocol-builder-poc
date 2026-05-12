/** Client-side full table snapshot (prototype persistence). */
export const ITEMS_SNAPSHOT_STORAGE_KEY = "lm_items_all_rows";

/**
 * @param {string | number} id
 * @returns {ItemRow | null}
 */
export function findItemInClientSnapshot(id) {
  if (typeof window === "undefined") return null;
  const key = id === undefined || id === null ? "" : String(id);
  try {
    const raw = sessionStorage.getItem(ITEMS_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const rows = JSON.parse(raw);
    if (!Array.isArray(rows)) return null;
    return rows.find((r) => String(r.id) === key) ?? null;
  } catch {
    return null;
  }
}

/** Primary UX types (Session vs Task) + legacy list types */
export const ITEM_TYPE_ORDER = [
  "session",
  "task",
  "system_formula",
  "compound",
  "service",
  "nutrition_item",
  "training_item",
];

export const ITEM_TYPE_META = {
  session: { label: "Session" },
  task: { label: "Task" },
  system_formula: { label: "System Formula" },
  compound: { label: "Compound" },
  service: { label: "Service" },
  nutrition_item: { label: "Nutrition" },
  training_item: { label: "Training" },
};

export const SESSION_TYPE_ORDER = /** @type {const} */ (["consultation", "follow_up", "check_in"]);

export const SESSION_TYPE_META = {
  consultation: { label: "Consultation" },
  follow_up: { label: "Follow-up" },
  check_in: { label: "Check-in" },
};

export const RECURRENCE_ORDER = /** @type {const} */ (["daily", "weekly", "monthly"]);

export const RECURRENCE_META = {
  daily: { label: "Daily" },
  weekly: { label: "Weekly" },
  monthly: { label: "Monthly" },
};

export const CONCIERGE_REMINDER_ORDER = /** @type {const} */ (["1", "2", "3"]);

/** Default form values for create + fallbacks when editing legacy rows */
export const EMPTY_ITEM_FORM_VALUES = {
  itemName: "",
  itemTypeKey: "session",
  pillarKey: "nutrition",
  sessionTypeKey: "consultation",
  recurrence: "weekly",
  dayBegins: "1",
  dayEnds: "90",
  conciergeReminder: "2",
  taskTime: "2 PM",
  instructions: "",
  contextWhat: "",
  contextExpectations: "",
  contextWhy: "",
  /** Matches ProtocolBuilder / protocolSupplementIcons */
  icon_id: "local_drink",
};

/**
 * Merges stored row fields with form defaults (session/task scheduling, context).
 * @param {Record<string, unknown>} row
 */
export function normalizeItemForForm(row) {
  if (!row || typeof row !== "object") return { ...EMPTY_ITEM_FORM_VALUES };
  const { id: _omitId, ...rest } = /** @type {Record<string, unknown> & { id?: number }} */ (row);
  const safeType = typeof rest.itemTypeKey === "string" && ITEM_TYPE_META[rest.itemTypeKey] ? rest.itemTypeKey : "task";
  const safePillar = typeof rest.pillarKey === "string" ? rest.pillarKey : EMPTY_ITEM_FORM_VALUES.pillarKey;
  return {
    ...EMPTY_ITEM_FORM_VALUES,
    ...rest,
    itemTypeKey: safeType,
    pillarKey: safePillar,
    itemName: typeof rest.itemName === "string" ? rest.itemName : "",
    icon_id: typeof rest.icon_id === "string" && rest.icon_id ? rest.icon_id : EMPTY_ITEM_FORM_VALUES.icon_id,
  };
}

/** @typedef {{ id: number, itemName: string, itemTypeKey: keyof typeof ITEM_TYPE_META, pillarKey: string }} ItemRow */

/** Mock rows aligned with program item picker IDs where names overlap */
export const ITEMS_MOCK = [
  { id: 124, itemName: "Vitality Boost System Formula", itemTypeKey: "system_formula", pillarKey: "supplements" },
  { id: 123, itemName: "Radiance Renewal System Formula", itemTypeKey: "system_formula", pillarKey: "supplements" },
  { id: 122, itemName: "Balance Core System Formula", itemTypeKey: "system_formula", pillarKey: "supplements" },
  { id: 121, itemName: "Clarity Focus System Formula", itemTypeKey: "compound", pillarKey: "supplements" },
  { id: 120, itemName: "Restful Night System Formula", itemTypeKey: "system_formula", pillarKey: "recovery" },
  { id: 119, itemName: "Joint Comfort System Formula", itemTypeKey: "compound", pillarKey: "recovery" },
  { id: 118, itemName: "Digestive Harmony System Formula", itemTypeKey: "system_formula", pillarKey: "nutrition" },
  { id: 117, itemName: "Immune Shield System Formula", itemTypeKey: "compound", pillarKey: "supplements" },
  { id: 116, itemName: "Energy Surge System Formula", itemTypeKey: "system_formula", pillarKey: "training" },
  { id: 115, itemName: "Cardio Support System Formula", itemTypeKey: "compound", pillarKey: "diagnostics" },
  { id: 114, itemName: "Skin Glow System Formula", itemTypeKey: "service", pillarKey: "regeneration" },
  { id: 113, itemName: "Bone Strength System Formula", itemTypeKey: "nutrition_item", pillarKey: "nutrition" },
];

/**
 * @param {string | number} id
 * @returns {ItemRow | null}
 */
export function getItemById(id) {
  const key = id === undefined || id === null ? "" : String(id);
  return ITEMS_MOCK.find((r) => String(r.id) === key) ?? null;
}
