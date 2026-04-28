import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { NeedsAttentionTable } from "./NeedsAttentionTable";
import { ReminderNotificationsTable } from "./ReminderNotificationsTable";

const REMINDERS = [
  { id: "R-1042", date: "Apr 26, 2026", from: "Care Team", title: "Lab results ready", description: "Your latest panel is available to review." },
  { id: "R-1041", date: "Apr 24, 2026", from: "Dr. Chen", title: "Follow-up scheduled", description: "Telehealth visit confirmed for next week." },
  { id: "R-1038", date: "Apr 22, 2026", from: "System", title: "Protocol updated", description: "Supplement timing was adjusted per clinician." },
  { id: "R-1035", date: "Apr 18, 2026", from: "Care Team", title: "Check-in reminder", description: "Please complete your weekly symptom log." },
];

const NEEDS_ATTENTION = [
  { date: "Apr 27, 2026", member: "Stephen M.", task: "Approve supplement stack", description: "New items pending clinician sign-off.", status: "Awaiting Approval" },
  { date: "Apr 25, 2026", member: "Maya K.", task: "Review diagnostics order", description: "GI-MAP requisition needs confirmation.", status: "Awaiting Approval" },
  { date: "Apr 23, 2026", member: "Alex R.", task: "Sign consent", description: "Training block consent form outstanding.", status: "Awaiting Approval" },
];

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <header className="flex shrink-0 items-center gap-4 border-b border-black/5 bg-white px-6 py-4">
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-gray-800">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-gray-900">Dashboard</li>
          </ol>
        </nav>
        <div className="ml-auto flex max-w-md flex-1 justify-end sm:max-w-xs">
          <label className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch />
            </span>
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
            />
          </label>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Welcome, Stephen!</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
              Here is a snapshot of your reminders and items that need your attention.
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Reminder notifications</h2>
            </div>
            <ReminderNotificationsTable rows={REMINDERS} />
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Needs attention</h2>
            </div>
            <NeedsAttentionTable rows={NEEDS_ATTENTION} />
            <div className="flex justify-center border-t border-gray-100 px-6 py-4">
              <nav className="flex items-center gap-2 text-sm text-gray-600" aria-label="Pagination">
                <button type="button" className="rounded px-2 py-1 hover:bg-gray-100" aria-label="Previous page">
                  &lt;
                </button>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`min-w-8 rounded px-2 py-1 ${n === 1 ? "bg-gray-900 font-medium text-white" : "hover:bg-gray-100"}`}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" className="rounded px-2 py-1 hover:bg-gray-100" aria-label="Next page">
                  &gt;
                </button>
              </nav>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
