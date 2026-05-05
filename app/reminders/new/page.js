import { AppShell } from "../../components/AppShell";
import { CreateReminderForm } from "../CreateReminderForm";
import { RemindersPageHeader } from "../RemindersPageHeader";

export default function NewReminderPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <RemindersPageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reminders", href: "/reminders" },
          { label: "Create Reminder" },
        ]}
      />

      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Create Reminder</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
          <CreateReminderForm />
        </div>
      </div>
    </AppShell>
  );
}
