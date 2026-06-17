"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { NEW_MESSAGE_MEMBER_OPTIONS } from "./messagesData";
import { appendSentInboxRow } from "./sentInboxStorage";
import { formatThreadReplyTimestamp } from "./threadRepliesStorage";

function previewFromCompose(subject, body) {
  const s = subject.trim();
  const b = body.trim().replace(/\s+/g, " ");
  const raw = s || b;
  if (!raw) return "";
  return raw.length > 140 ? `${raw.slice(0, 137)}…` : raw;
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" aria-hidden>
      <path d="M7 18a4 4 0 0 1-1-7.87V10a5 5 0 0 1 9.9-1" />
      <path d="M17 18a4 4 0 0 0 2-7.5" />
    </svg>
  );
}

export function NewMessageClient() {
  const router = useRouter();
  const [to, setTo] = useState(NEW_MESSAGE_MEMBER_OPTIONS[0]?.value ?? "");
  const [subject, setSubject] = useState("More training plans!");
  const [body, setBody] = useState("Explore a variety of new training! Let me know what you think!");
  const [files, setFiles] = useState([
    { id: "1", name: "Training Plan.pdf", size: "2mb" },
    { id: "2", name: "Training Plan.pdf", size: "2mb" },
  ]);

  const canSend = Boolean(to && previewFromCompose(subject, body));

  function send() {
    const member = NEW_MESSAGE_MEMBER_OPTIONS.find((o) => o.value === to);
    const preview = previewFromCompose(subject, body);
    if (!to || !preview) return;
    const sentAt = new Date();
    appendSentInboxRow({
      threadId: to,
      memberName: member?.label ?? "Member",
      lastAtISO: sentAt.toISOString(),
      displayDate: formatThreadReplyTimestamp(sentAt),
      lastFrom: "You",
      preview,
      unread: false,
    });
    router.push("/messages");
  }

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4] text-gray-900">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb
            crumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "Messages", href: "/messages" },
              { label: "New Message" },
            ]}
          />

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">New Message</h1>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              Select the receiver for your message, add a subject, and write a message for any member. They will receive
              it in their preferred messaging app.
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="space-y-5">
                <div>
                  <label htmlFor="msg-to" className="mb-1.5 block text-sm font-medium text-gray-800">
                    To
                  </label>
                  <div className="relative">
                    <select
                      id="msg-to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full appearance-none rounded-[10px] border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm text-gray-900 outline-none focus:border-gray-300"
                    >
                      {NEW_MESSAGE_MEMBER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="msg-subject" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Subject
                  </label>
                  <input
                    id="msg-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-300"
                  />
                </div>
                <div>
                  <label htmlFor="msg-body" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Message
                  </label>
                  <textarea
                    id="msg-body"
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full resize-y rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-300"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-gray-800">Attach files</p>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
                  <IconCloud />
                  <p className="mt-3 text-sm text-gray-600">
                    Drag and drop your files here or{" "}
                    <button type="button" className="font-semibold text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-700">
                      browse
                    </button>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Max file size up to 2mb</p>
                </div>
                <ul className="mt-4 space-y-2">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-[10px] border border-gray-100 bg-gray-50/60 px-3 py-2.5 text-sm"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-[10px] font-bold text-gray-500">
                        PDF
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-500">{f.size}</p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-200/80 hover:text-gray-700"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                      >
                        <IconTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
              <button type="button" onClick={() => router.push("/messages")} className="btn-lifemuse-secondary">
                Cancel
              </button>
              <button type="button" onClick={send} disabled={!canSend} className="btn-lifemuse-primary disabled:pointer-events-none disabled:opacity-40">
                Send
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
