import { Suspense } from "react";
import { AppShell } from "../components/AppShell";
import { PROGRAMS_MOCK } from "./programsData";
import { ProgramsListClient } from "./ProgramsListClient";

function ProgramsListFallback() {
  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-10 w-64 max-w-full rounded bg-gray-200" />
        <div className="h-24 max-w-2xl rounded bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200/80" />
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <Suspense fallback={<ProgramsListFallback />}>
        <ProgramsListClient initialRows={PROGRAMS_MOCK} />
      </Suspense>
    </AppShell>
  );
}
