import { Suspense } from "react";
import { BASE_PROTOCOLS } from "../baseProtocols";
import { PROTOCOL_CATALOG_ID_TO_TEMPLATE_ID } from "../protocolTemplateMap";
import ProtocolDetailBuilderClient from "../ProtocolDetailBuilderClient";

export default async function ProtocolDetailPage({ params }) {
  const { id } = await params;
  const protocolId = decodeURIComponent(String(id ?? ""));
  const initialCatalogRow = BASE_PROTOCOLS.find((r) => r.id === protocolId) ?? null;
  const initialTemplateId = PROTOCOL_CATALOG_ID_TO_TEMPLATE_ID[protocolId] ?? null;

  return (
    <Suspense fallback={null}>
      <ProtocolDetailBuilderClient
        protocolId={protocolId}
        initialCatalogRow={initialCatalogRow}
        initialTemplateId={initialTemplateId}
      />
    </Suspense>
  );
}
