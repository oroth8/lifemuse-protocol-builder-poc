import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { DashboardWelcomeHeading } from "./DashboardWelcomeHeading";
import { NeedsAttentionSection } from "./NeedsAttentionSection";
import { ReminderNotificationsTable } from "./ReminderNotificationsTable";

/** `reminderId` is the sent-reminder record id (see `remindersData`) for deep links from the dashboard. */
const REMINDERS = [
  { id: "R-1042", reminderId: "55448", date: "Apr 26, 2026", from: "Care Team", importance: "High", title: "Lab results ready", description: "Your latest panel is available to review." },
  { id: "R-1041", reminderId: "55451", date: "Apr 24, 2026", from: "Dr. Chen", importance: "Medium", title: "Follow-up scheduled", description: "Telehealth visit confirmed for next week." },
  { id: "R-1038", reminderId: "55450", date: "Apr 22, 2026", from: "System", importance: "Low", title: "Protocol updated", description: "Supplement timing was adjusted per clinician." },
  { id: "R-1035", reminderId: "55449", date: "Apr 18, 2026", from: "Care Team", importance: "Medium", title: "Check-in reminder", description: "Please complete your weekly symptom log." },
];

const NEEDS_ATTENTION = [
  { date: "Apr 27, 2026", member: "Stephen M.", task: "Approve supplement stack", description: "New items pending clinician sign-off.", status: "Awaiting Approval" },
  { date: "Apr 25, 2026", member: "Maya K.", task: "Review diagnostics order", description: "GI-MAP requisition needs confirmation.", status: "Awaiting Approval" },
  { date: "Apr 23, 2026", member: "Alex R.", task: "Sign consent", description: "Training block consent form outstanding.", status: "Awaiting Approval" },
];

export default function DashboardPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <PageBreadcrumb crumbs={[{ label: "Home" }]} />

          <div>
            <DashboardWelcomeHeading />
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
            <NeedsAttentionSection rows={NEEDS_ATTENTION} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
