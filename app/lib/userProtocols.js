import { BASE_PROTOCOLS } from "../protocols/baseProtocols";

const STORAGE_KEY = "lifemuse_user_protocols";

function formatUpdated() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function nextProtocolId() {
  let max = 0;
  let user = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    user = raw ? JSON.parse(raw) : [];
  } catch {
    user = [];
  }
  for (const r of [...BASE_PROTOCOLS, ...user]) {
    const m = /^PR-(\d+)$/i.exec(String(r.id));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `PR-${String(max + 1).padStart(3, "0")}`;
}

export function readUserProtocols() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Prepend a protocol row and persist. Returns the new row. */
export function addUserProtocol({ name, version = "1.0", status, updated }) {
  const entry = {
    id: nextProtocolId(),
    name: name || "Untitled protocol",
    version,
    updated: updated || formatUpdated(),
    status,
  };
  const list = readUserProtocols();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...list]));
  return entry;
}
