import { AppShell } from "../components/AppShell";

export default function MessagesPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-2 text-gray-600">Your conversations will appear here.</p>
      </div>
    </AppShell>
  );
}
