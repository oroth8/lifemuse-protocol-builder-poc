import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { MEMBERS } from "./data";
import { MembersTable } from "./MembersTable";

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function MembersPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Members" }]} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Members</h1>
              <p className="mt-1 text-sm text-gray-600">
                Browse members and open a profile to manage care plans, progress notes, and related records.
              </p>
            </div>
            <button type="button" className="btn-lifemuse-primary gap-2">
              <IconPlus />
              Create new member
            </button>
          </div>

          <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
              <label className="relative block max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                />
              </label>
            </div>

            <MembersTable rows={MEMBERS} />

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <select className="rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-900 focus:border-gray-300 focus:outline-none">
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
                <span>per page</span>
              </label>
              <p className="text-sm text-gray-600">Displaying {MEMBERS.length} items</p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
