const STORAGE_KEY = "lifemuse-protocol-builder-thread-replies";

/** @typedef {{ id: string, displayDate: string, from: string, body: string }} ThreadLine */

/**
 * @param {string} threadId
 * @returns {ThreadLine[]}
 */
export function loadThreadReplies(threadId) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    const list = all?.[threadId];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} threadId
 * @param {ThreadLine} line
 */
export function appendThreadReply(threadId, line) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (typeof all !== "object" || all === null) return;
    const prev = Array.isArray(all[threadId]) ? all[threadId] : [];
    all[threadId] = [...prev, line];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota / parse */
  }
}

/** Matches inbox mock style, e.g. `3/3/26 - 10:15AM`. */
export function formatThreadReplyTimestamp(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const yy = String(d.getFullYear()).slice(-2);
  let h = d.getHours();
  const minutes = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = String(minutes).padStart(2, "0");
  return `${month}/${day}/${yy} - ${h}:${mm}${ampm}`;
}
