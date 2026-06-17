"use client";

import { useSearchParams } from "next/navigation";
import ProtocolBuilder from "../components/ProtocolBuilder";

export default function ProtocolBuilderPageClient() {
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant") === "care-review" ? "care-review" : "default";
  return <ProtocolBuilder variant={variant} />;
}
