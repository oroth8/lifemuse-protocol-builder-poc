export function parseDateish(s) {
  const t = Date.parse(s);
  return Number.isNaN(t) ? 0 : t;
}

export function compareByValue(va, vb, mult) {
  if (typeof va === "number" && typeof vb === "number") {
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    return 0;
  }
  return mult * String(va ?? "").localeCompare(String(vb ?? ""), undefined, { sensitivity: "base", numeric: true });
}

export function sortRows(rows, sortKey, sortDir, getValue) {
  const mult = sortDir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => compareByValue(getValue(a, sortKey), getValue(b, sortKey), mult));
}
