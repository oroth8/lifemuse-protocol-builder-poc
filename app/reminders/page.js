import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { REMINDERS_SENT } from "./remindersData";
import { RemindersTable } from "./RemindersTable";

export default function RemindersPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reminders" }]} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Reminders</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                On this section you can see all the reminders you sent to any member in Lifemuse. Click on any to check the
                details.
              </p>
            </div>
            <Link href="/reminders/new" className="btn-lifemuse-primary shrink-0">
              Create Reminder
            </Link>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <RemindersTable rows={REMINDERS_SENT} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
