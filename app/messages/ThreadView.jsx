"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { appendThreadReply, formatThreadReplyTimestamp, loadThreadReplies } from "./threadRepliesStorage";

export function ThreadView({ threadId, memberName, messages }) {
  const [lines, setLines] = useState(messages);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setLines([...messages, ...loadThreadReplies(threadId)]);
  }, [threadId, messages]);

  const title = `${memberName}'s Messages`;

  function send() {
    const body = draft.trim();
    if (!body) return;
    const line = {
      id: `reply-${threadId}-${Date.now()}`,
      displayDate: formatThreadReplyTimestamp(),
      from: "You",
      body,
    };
    appendThreadReply(threadId, line);
    setLines((prev) => [...prev, line]);
    setDraft("");
  }

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4] text-gray-900">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb
            crumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "Messages", href: "/messages" },
              { label: title },
            ]}
          />

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Here you can find all the messages from your members. Pay attention to the new messages and answer those
              quickly.
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="whitespace-nowrap px-6 py-3">Date</th>
                    <th className="whitespace-nowrap px-6 py-3">From</th>
                    <th className="px-6 py-3">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((m, i) => {
                    const fromYou = m.from === "You";
                    const rowTone = fromYou ? "text-gray-600" : "font-medium text-gray-900";
                    return (
                      <tr key={m.id} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className={`whitespace-nowrap px-6 py-3.5 align-top ${rowTone}`}>{m.displayDate}</td>
                        <td className={`whitespace-nowrap px-6 py-3.5 align-top ${rowTone}`}>{m.from}</td>
                        <td className={`px-6 py-3.5 align-top leading-relaxed text-gray-700 ${fromYou ? "" : "font-normal"}`}>{m.body}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 p-6">
              <label className="sr-only" htmlFor={`reply-${threadId}`}>
                Write your message
              </label>
              <textarea
                id={`reply-${threadId}`}
                rows={4}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write your message…"
                className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
              />
              <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                <Link href="/messages" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Back to inbox
                </Link>
                <button type="button" onClick={send} disabled={!draft.trim()} className="btn-lifemuse-primary disabled:pointer-events-none disabled:opacity-40">
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
