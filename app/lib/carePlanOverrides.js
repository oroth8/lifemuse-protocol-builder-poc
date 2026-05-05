const STORAGE_KEY = "lifemuse_care_plan_item_overrides";

function key(memberId, itemId) {
  return `${memberId}:${itemId}`;
}

export function readCarePlanOverrides() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/** @returns {{ status?: string, dueDate?: string, dueAt?: string } | null} */
export function getCarePlanItemOverride(memberId, itemId) {
  const all = readCarePlanOverrides();
  return all[key(memberId, itemId)] ?? null;
}

/** Patch merged onto the base row (status, dueDate, dueAt for scheduled bookings). */
export function setCarePlanItemOverride(memberId, itemId, patch) {
  const all = readCarePlanOverrides();
  const prev = all[key(memberId, itemId)] || {};
  all[key(memberId, itemId)] = { ...prev, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("care-plan-status-updated"));
  }
}

export function mergeCarePlanRow(memberId, row) {
  const o = getCarePlanItemOverride(memberId, row.id);
  if (!o) return row;
  return { ...row, ...o };
}
