"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { INBOX_THREADS } from "./messagesData";
import { MessagesInboxTable } from "./MessagesInboxTable";
import { mergeInboxWithSent, sortedInboxSeed, subscribeSentInbox } from "./sentInboxStorage";

export function MessagesPageContent() {
  const [rows, setRows] = useState(() => sortedInboxSeed(INBOX_THREADS));
  const [sentTick, setSentTick] = useState(0);

  useEffect(() => {
    return subscribeSentInbox(() => setSentTick((t) => t + 1));
  }, []);

  useEffect(() => {
    setRows(mergeInboxWithSent(INBOX_THREADS));
  }, [sentTick]);

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4] text-gray-900">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Messages" }]} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Messages</h1>
              <p className="mt-1 text-sm text-gray-600">
                Here you can find all the messages from your members. Pay attention to the new messages and answer those
                quickly.
              </p>
            </div>
            <Link href="/messages/new" className="btn-lifemuse-primary shrink-0 self-start sm:self-center">
              New Message
            </Link>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <MessagesInboxTable rows={rows} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
