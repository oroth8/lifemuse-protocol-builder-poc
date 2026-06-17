"use client";

import { useEffect, useRef } from "react";

/**
 * Shared table pagination: consistent shape/colors with globals `.btn-table-page`.
 * Optionally scrolls `scrollAnchorRef` into view when the page changes (smooth, no harsh jump).
 */
export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  scrollAnchorRef,
  ariaLabel = "Pagination",
}) {
  const prevPage = useRef(currentPage);

  useEffect(() => {
    const prev = prevPage.current;
    if (prev !== currentPage) {
      scrollAnchorRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    prevPage.current = currentPage;
  }, [currentPage, scrollAnchorRef]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center border-t border-gray-100 px-6 py-4">
      <nav className="flex items-center gap-1.5 text-sm" aria-label={ariaLabel}>
        <button
          type="button"
          className="btn-table-page"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={`btn-table-page ${n === currentPage ? "btn-table-page-active" : ""}`}
            onClick={() => onPageChange(n)}
            aria-current={n === currentPage ? "page" : undefined}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="btn-table-page"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &gt;
        </button>
      </nav>
    </div>
  );
}
