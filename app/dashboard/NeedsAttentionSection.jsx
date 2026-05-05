"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TablePagination } from "../components/TablePagination";
import { NeedsAttentionTable } from "./NeedsAttentionTable";

const PAGE_SIZE = 2;

export function NeedsAttentionSection({ rows }) {
  const scrollAnchorRef = useRef(null);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  return (
    <>
      <div ref={scrollAnchorRef} className="scroll-mt-6" />
      <NeedsAttentionTable rows={pageRows} />
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        scrollAnchorRef={scrollAnchorRef}
        ariaLabel="Needs attention pagination"
      />
    </>
  );
}
