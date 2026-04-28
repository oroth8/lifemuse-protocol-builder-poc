import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ProtocolsTable } from "./ProtocolsTable";

const PROTOCOLS = [
  { id: "PR-001", name: "Foundational metabolic support", version: "2.1", updated: "Apr 26, 2026", status: "Active" },
  { id: "PR-002", name: "Training block — strength", version: "1.0", updated: "Apr 20, 2026", status: "Draft" },
  { id: "PR-003", name: "Recovery & regeneration", version: "3.4", updated: "Apr 12, 2026", status: "Active" },
  { id: "PR-004", name: "Diagnostics prep", version: "1.2", updated: "Mar 28, 2026", status: "Archived" },
];

export default function ProtocolsPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4] text-gray-900">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <nav className="text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Home
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li className="font-medium text-gray-600">Protocols</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Protocols</h1>
              <p className="mt-1 text-sm text-gray-600">Manage protocol templates and open the builder to create new ones.</p>
            </div>
            <Link href="/protocol-builder" className="btn-lifemuse-primary">
              Build new protocol
            </Link>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <ProtocolsTable rows={PROTOCOLS} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
