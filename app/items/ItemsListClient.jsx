"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PILLAR_META } from "../categories/categoriesData";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { SortableTh } from "../components/SortableTh";
import { TablePagination } from "../components/TablePagination";
import { useTableSort } from "../hooks/useTableSort";
import { sortRows } from "../lib/tableSort";
import { ITEM_TYPE_META, ITEMS_SNAPSHOT_STORAGE_KEY } from "./itemsData";

const PAGE_SIZE = 10;
const PENDING_KEY = "lm_items_pending";

function loadRowsSnapshot(fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(ITEMS_SNAPSHOT_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return fallback;
}

function persistRowsSnapshot(next) {
  try {
    sessionStorage.setItem(ITEMS_SNAPSHOT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-600" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SelectAllCheckbox({ checked, indeterminate, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="rounded border-gray-300 text-gray-900"
      aria-label="Select all on this page"
    />
  );
}

function SuccessToast({ message, onDismiss }) {
  return (
    <div
      role="status"
      className="fixed right-4 top-[4.5rem] z-[60] flex max-w-md items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <IconCheck />
      </span>
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <button type="button" onClick={onDismiss} className="ml-1 shrink-0 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800" aria-label="Dismiss notification">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function itemSortValue(row, key) {
  if (key === "itemType") return (ITEM_TYPE_META[row.itemTypeKey]?.label ?? "").toLowerCase();
  if (key === "pillar") return PILLAR_META[row.pillarKey].label.toLowerCase();
  if (key === "id") return String(row.id).toLowerCase();
  return String(row[key] ?? "").toLowerCase();
}

function applyPendingFromStorage(setRows) {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    sessionStorage.removeItem(PENDING_KEY);
    if (!parsed || typeof parsed !== "object") return;
    if (parsed.op === "create" && parsed.row) {
      setRows((prev) => {
        const withoutDup = prev.filter((r) => r.id !== parsed.row.id);
        const next = [parsed.row, ...withoutDup];
        persistRowsSnapshot(next);
        return next;
      });
      return;
    }
    if (parsed.op === "update" && parsed.row) {
      setRows((prev) => {
        const next = prev.map((r) => (r.id === parsed.row.id ? { ...r, ...parsed.row } : r));
        persistRowsSnapshot(next);
        return next;
      });
    }
  } catch {
    sessionStorage.removeItem(PENDING_KEY);
  }
}

export function ItemsListClient({ initialRows }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollAnchorRef = useRef(null);

  const [rows, setRows] = useState(() => loadRowsSnapshot(initialRows));
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [toastOpen, setToastOpen] = useState(false);

  const { sortKey, sortDir, toggleSort } = useTableSort("itemName", "asc");

  useEffect(() => {
    if (searchParams.get("added") === "1") {
      applyPendingFromStorage(setRows);
      setToastOpen(true);
      router.replace("/items", { scroll: false });
    }
  }, [searchParams, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const pillar = PILLAR_META[r.pillarKey].label.toLowerCase();
      const typeLabel = (ITEM_TYPE_META[r.itemTypeKey]?.label ?? "").toLowerCase();
      return (
        pillar.includes(q) ||
        typeLabel.includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        String(r.id).toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const sorted = useMemo(() => sortRows(filtered, sortKey, sortDir, itemSortValue), [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [sortKey, sortDir, query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageIds = useMemo(() => new Set(pageSlice.map((r) => r.id)), [pageSlice]);
  const allOnPageSelected = pageSlice.length > 0 && pageSlice.every((r) => selectedIds.has(r.id));
  const someOnPageSelected = pageSlice.some((r) => selectedIds.has(r.id));

  const toggleRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  }, [allOnPageSelected, pageIds]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setRows((prev) => {
      const next = prev.filter((r) => !selectedIds.has(r.id));
      persistRowsSnapshot(next);
      return next;
    });
    setSelectedIds(new Set());
  }, [selectedIds]);

  return (
    <>
      {toastOpen ? <SuccessToast message="Item saved successfully." onDismiss={() => setToastOpen(false)} /> : null}

      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Items" }]} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Items</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                Manage individual items that can be grouped into programs and added to protocols.
              </p>
            </div>
            <Link href="/items/new" className="btn-lifemuse-primary shrink-0 self-start sm:self-center">
              Create Item
            </Link>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <label className="relative block w-full max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                />
              </label>
              <button type="button" onClick={deleteSelected} disabled={selectedIds.size === 0} className="btn-lifemuse-danger shrink-0 disabled:pointer-events-none disabled:opacity-40">
                <IconTrash />
                Delete Selected
              </button>
            </div>

            <div ref={scrollAnchorRef} className="scroll-mt-6" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed text-left text-sm">
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "6%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <SortableTh columnKey="id" label="ID" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[10%] whitespace-nowrap px-4 py-3 sm:px-5" />
                    <SortableTh columnKey="itemName" label="Item Name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[40%] px-4 py-3 sm:px-5" />
                    <SortableTh columnKey="itemType" label="Type of Item" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[22%] whitespace-nowrap px-4 py-3 sm:px-5" />
                    <SortableTh columnKey="pillar" label="Pillar" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="w-[22%] whitespace-nowrap px-4 py-3 sm:px-5" />
                    <th className="w-[6%] px-4 py-3 sm:px-5">
                      <span className="sr-only">Select</span>
                      <SelectAllCheckbox checked={allOnPageSelected} indeterminate={!allOnPageSelected && someOnPageSelected} onChange={toggleSelectAllPage} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((row, i) => (
                    <tr key={row.id} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
                      <td className="whitespace-nowrap px-4 py-3.5 align-middle font-medium tabular-nums text-gray-900 sm:px-5">{row.id}</td>
                      <td className="min-w-0 px-4 py-3.5 align-middle sm:px-5">
                        <Link href={`/items/${encodeURIComponent(row.id)}/edit`} className="block truncate font-medium text-blue-600 hover:text-blue-700 hover:underline" title={row.itemName}>
                          {row.itemName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-middle sm:px-5">
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          {ITEM_TYPE_META[row.itemTypeKey]?.label ?? row.itemTypeKey}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 align-middle sm:px-5">
                        <span className={PILLAR_META[row.pillarKey].className}>{PILLAR_META[row.pillarKey].label}</span>
                      </td>
                      <td className="px-4 py-3.5 align-middle sm:px-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="rounded border-gray-300"
                          aria-label={`Select ${row.itemName}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              scrollAnchorRef={scrollAnchorRef}
              ariaLabel="Items pagination"
            />
          </section>
        </div>
      </div>
    </>
  );
}
