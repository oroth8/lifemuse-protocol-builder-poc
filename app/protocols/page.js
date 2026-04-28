import Link from "next/link";
import { AppShell } from "../components/AppShell";

const PROTOCOLS = [
  { id: "PR-001", name: "Foundational metabolic support", version: "2.1", updated: "Apr 26, 2026", status: "Active" },
  { id: "PR-002", name: "Training block — strength", version: "1.0", updated: "Apr 20, 2026", status: "Draft" },
  { id: "PR-003", name: "Recovery & regeneration", version: "3.4", updated: "Apr 12, 2026", status: "Active" },
  { id: "PR-004", name: "Diagnostics prep", version: "1.2", updated: "Mar 28, 2026", status: "Archived" },
];

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function ProtocolsPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-white text-gray-900">
      <div className="flex-1 overflow-auto bg-white p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Version</th>
                    <th className="px-6 py-3">Updated</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="w-12 px-6 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {PROTOCOLS.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">{row.id}</td>
                      <td className="px-6 py-3.5 text-gray-900">{row.name}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.version}</td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-gray-600">{row.updated}</td>
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">{row.status}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button type="button" className="flex rounded p-1 hover:bg-gray-100" aria-label="Open protocol">
                          <IconChevron />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
