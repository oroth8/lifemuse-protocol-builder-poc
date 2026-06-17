"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_ITEM_DEFAULT_SELECTED_IDS,
  CATEGORY_ITEM_PICKER_ROWS,
  PILLAR_META,
  PILLAR_TAG_ORDER,
} from "../categories/categoriesData";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { TablePagination } from "../components/TablePagination";

const PAGE_SIZE = 10;

function IconChevronLeft({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/**
 * @param {{ mode: "create" | "edit", initialProgramName: string, initialPillarKey: string }} props
 */
export function ProgramFormClient({ mode, initialProgramName, initialPillarKey }) {
  const router = useRouter();
  const scrollAnchorRef = useRef(null);

  const [programName, setProgramName] = useState(initialProgramName);
  const [pillarKey, setPillarKey] = useState(initialPillarKey);
  const [selectedItemIds, setSelectedItemIds] = useState(() => new Set(CATEGORY_ITEM_DEFAULT_SELECTED_IDS));
  const [page, setPage] = useState(1);

  useEffect(() => {
    setProgramName(initialProgramName);
    setPillarKey(initialPillarKey);
  }, [initialProgramName, initialPillarKey]);

  const totalPages = Math.max(1, Math.ceil(CATEGORY_ITEM_PICKER_ROWS.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return CATEGORY_ITEM_PICKER_ROWS.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleItem(id) {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    router.push("/programs?added=1");
  }

  const pillarOptions = PILLAR_TAG_ORDER.map((key) => ({
    key,
    label: PILLAR_META[key].label,
  }));

  const title = mode === "create" ? "Create New Program" : "Edit Program";
  const crumbs =
    mode === "create"
      ? [
          { label: "Home", href: "/dashboard" },
          { label: "Programs", href: "/programs" },
          { label: "Create New Program" },
        ]
      : [
          { label: "Home", href: "/dashboard" },
          { label: "Programs", href: "/programs" },
          { label: "Edit Program" },
        ];

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageBreadcrumb crumbs={crumbs} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/programs" className="shrink-0 rounded-lg p-1 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900" aria-label="Back to programs">
              <IconChevronLeft className="block" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
          </div>
          <button type="button" onClick={save} className="btn-lifemuse-primary shrink-0">
            Save
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Program Name</span>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-300"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Pillar</span>
                <select
                  value={pillarKey}
                  onChange={(e) => setPillarKey(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-300"
                >
                  {pillarOptions.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                  <colgroup>
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "80%" }} />
                    <col style={{ width: "6%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="w-[14%] whitespace-nowrap px-4 py-3 sm:px-5">ID</th>
                      <th className="w-[80%] px-4 py-3 sm:px-5">Item Name</th>
                      <th className="w-[6%] px-4 py-3 sm:px-5">
                        <span className="sr-only">Include</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map((row, i) => (
                      <tr key={row.id} className={`border-b border-gray-100 last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
                        <td className="whitespace-nowrap px-4 py-3.5 align-middle sm:px-5">
                          <Link href={`/items/${encodeURIComponent(row.id)}/edit`} className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                            {row.id}
                          </Link>
                        </td>
                        <td className="min-w-0 px-4 py-3.5 align-middle sm:px-5">
                          <div className="truncate" title={row.name}>
                            {row.name}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-middle sm:px-5">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.has(row.id)}
                            onChange={() => toggleItem(row.id)}
                            className="rounded border-gray-300"
                            aria-label={`Include ${row.name}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div ref={scrollAnchorRef} className="scroll-mt-6" />
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                scrollAnchorRef={scrollAnchorRef}
                ariaLabel="Program items pagination"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
