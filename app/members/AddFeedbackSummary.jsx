"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { RichTextEditor } from "../components/RichTextEditor";

const DISPLAY_DATE = "July 23, 2025 - 11:32 am";

function hasTextFromHtml(html) {
  if (!html?.trim()) return false;
  return html.replace(/<[^>]*>/g, "").trim().length > 0;
}

function BackTitle({ href, children }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3 text-gray-900">
      <svg
        className="shrink-0 text-gray-600 transition group-hover:text-gray-900"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="text-3xl font-bold tracking-tight">{children}</span>
    </Link>
  );
}

export function AddFeedbackSummary({ member }) {
  const manageHref = `/members/${member.id}/feedback-summary`;
  const [feedbackHtml, setFeedbackHtml] = useState("");

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4] text-gray-900">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb
            crumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "Members", href: "/members" },
              { label: member.fullName, href: `/members/${member.id}` },
              { label: "Manage Feedback Summary", href: manageHref },
              { label: "Add Feedback Summary" },
            ]}
          />

          <BackTitle href={manageHref}>Add Feedback Summary</BackTitle>

          <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <div className="space-y-5 p-6 sm:p-8">
              <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-center">
                <span className="text-sm font-semibold text-gray-900">Member</span>
                <p className="text-sm text-gray-700">{member.fullName}</p>
              </div>
              <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-center">
                <span className="text-sm font-semibold text-gray-900">Date</span>
                <p className="text-sm text-gray-700">{DISPLAY_DATE}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-start">
                <span className="pt-2 text-sm font-semibold text-gray-900">Feedback</span>
                <RichTextEditor onChange={setFeedbackHtml} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 sm:px-8">
              <button type="button" className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">
                Save as Draft
              </button>
              <button
                type="button"
                disabled={!hasTextFromHtml(feedbackHtml)}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
