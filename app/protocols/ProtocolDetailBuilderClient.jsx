"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import ProtocolBuilder from "../components/ProtocolBuilder";
import { readUserProtocols } from "../lib/userProtocols";
import { BASE_PROTOCOLS } from "./baseProtocols";
import { PROTOCOL_CATALOG_ID_TO_TEMPLATE_ID } from "./protocolTemplateMap";

function mergeCatalogRows() {
  if (typeof window === "undefined") return BASE_PROTOCOLS;
  try {
    return [...readUserProtocols(), ...BASE_PROTOCOLS];
  } catch {
    return BASE_PROTOCOLS;
  }
}

export default function ProtocolDetailBuilderClient({ protocolId, initialCatalogRow, initialTemplateId }) {
  const [row, setRow] = useState(initialCatalogRow ?? null);
  const [ready, setReady] = useState(Boolean(initialCatalogRow));

  useEffect(() => {
    const found = mergeCatalogRows().find((r) => r.id === protocolId) ?? null;
    setRow(found);
    setReady(true);
  }, [protocolId]);

  if (!ready) {
    return null;
  }

  if (!row) {
    notFound();
  }

  const templateId = initialTemplateId ?? PROTOCOL_CATALOG_ID_TO_TEMPLATE_ID[protocolId] ?? null;

  const catalogProtocolRow = useMemo(
    () =>
      row
        ? {
            id: row.id,
            name: row.name,
            version: row.version,
            updated: row.updated,
            status: row.status,
          }
        : null,
    [row],
  );

  return (
    <ProtocolBuilder variant="default" initialTemplateId={templateId} catalogProtocolRow={catalogProtocolRow} />
  );
}
