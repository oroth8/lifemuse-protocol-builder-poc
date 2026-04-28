import { AppShell } from "../components/AppShell";

export default function RemindersPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="mt-2 text-gray-600">This section will list your reminders.</p>
        </div>
      </div>
    </AppShell>
  );
}
