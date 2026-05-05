import { Suspense } from "react";
import ProtocolBuilderPageClient from "./ProtocolBuilderPageClient";

export default function ProtocolBuilderPage() {
  return (
    <Suspense fallback={null}>
      <ProtocolBuilderPageClient />
    </Suspense>
  );
}
