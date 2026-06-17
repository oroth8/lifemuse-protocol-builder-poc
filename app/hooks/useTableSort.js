"use client";

import { useCallback, useState } from "react";

export function useTableSort(initialKey, initialDir = "asc") {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);
  const toggleSort = useCallback((key) => {
    setSortKey((k) => {
      if (k === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return k;
      }
      setSortDir("asc");
      return key;
    });
  }, []);
  return { sortKey, sortDir, toggleSort };
}
