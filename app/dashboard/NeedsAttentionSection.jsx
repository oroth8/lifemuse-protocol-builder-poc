"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrototypeRole } from "../components/PrototypeRoleProvider";
import { TablePagination } from "../components/TablePagination";
import { NEEDS_ATTENTION_AMY } from "./needsAttentionAmy";
import { NeedsAttentionTable } from "./NeedsAttentionTable";

const PAGE_SIZE_CONCIERGE = 2;
const PAGE_SIZE_AMY = 5;

export function NeedsAttentionSection({ rows: defaultRows }) {
  const { role } = usePrototypeRole();
  const isAmy = role.id === "care_team";
  const rows = isAmy ? NEEDS_ATTENTION_AMY : defaultRows;
  const pageSize = isAmy ? PAGE_SIZE_AMY : PAGE_SIZE_CONCIERGE;

  const scrollAnchorRef = useRef(null);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [isAmy]);

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
