import { notFound } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { ReminderDetail } from "../ReminderDetail";
import { RemindersPageHeader } from "../RemindersPageHeader";
import { getReminderById } from "../remindersData";

export default async function ReminderDetailPage({ params }) {
  const { id } = await params;
  const reminder = getReminderById(id);
  if (!reminder) notFound();

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <RemindersPageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reminders", href: "/reminders" },
          { label: `Reminder #${reminder.id}` },
        ]}
      />

      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <ReminderDetail reminder={reminder} />
        </div>
      </div>
    </AppShell>
  );
}
