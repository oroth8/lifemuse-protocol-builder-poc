const STORAGE_KEY = "lifemuse-protocol-builder-sent-inbox";

const CHANGED_EVENT = "lifemuse-sent-inbox-changed";

/** @typedef {{ threadId: string, memberName: string, lastAtISO: string, displayDate: string, lastFrom: string, preview: string, unread?: boolean }} InboxThreadRow */

function loadSentList() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * @param {InboxThreadRow[]} seed
 * @returns {InboxThreadRow[]}
 */
export function sortedInboxSeed(seed) {
  return [...seed].sort((a, b) => Date.parse(b.lastAtISO) - Date.parse(a.lastAtISO));
}

/**
 * @param {InboxThreadRow[]} seed
 * @returns {InboxThreadRow[]}
 */
export function mergeInboxWithSent(seed) {
  const sentList = typeof window !== "undefined" ? loadSentList() : [];
  const map = new Map(seed.map((r) => [r.threadId, { ...r }]));
  for (const s of sentList) {
    if (!s?.threadId) continue;
    const base = map.get(s.threadId);
    map.set(s.threadId, {
      ...(base ?? {}),
      threadId: s.threadId,
      memberName: base?.memberName ?? s.memberName ?? "Member",
      lastAtISO: s.lastAtISO,
      displayDate: s.displayDate,
      lastFrom: s.lastFrom ?? "You",
      preview: s.preview ?? "",
      unread: s.unread ?? false,
    });
  }
  return [...map.values()].sort((a, b) => Date.parse(b.lastAtISO) - Date.parse(a.lastAtISO));
}

/**
 * @param {Omit<InboxThreadRow, "unread"> & { unread?: boolean }} row
 */
export function appendSentInboxRow(row) {
  if (typeof window === "undefined") return;
  try {
    const list = loadSentList();
    list.push({
      threadId: row.threadId,
      memberName: row.memberName,
      lastAtISO: row.lastAtISO,
      displayDate: row.displayDate,
      lastFrom: row.lastFrom,
      preview: row.preview,
      unread: row.unread ?? false,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Same-tab + cross-tab updates after a send. */
export function subscribeSentInbox(onChange) {
  if (typeof window === "undefined") return () => {};
  const h = () => onChange();
  window.addEventListener(CHANGED_EVENT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(CHANGED_EVENT, h);
    window.removeEventListener("storage", h);
  };
}
