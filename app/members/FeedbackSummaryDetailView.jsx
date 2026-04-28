"use client";

import Link from "next/link";
import { AppShell } from "../components/AppShell";

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

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export function FeedbackSummaryDetailView({ member, row }) {
  const manageHref = `/members/${member.id}/feedback-summary`;

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4] text-gray-900">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <nav className="text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Home
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li>
                <Link href="/members" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Members
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li>
                <Link href={`/members/${member.id}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                  {member.fullName}
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li>
                <Link href={manageHref} className="text-blue-600 hover:text-blue-700 hover:underline">
                  Manage Feedback Summary
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li className="font-medium text-gray-600">Feedback Summary #{row.id}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BackTitle href={manageHref}>Feedback Summary #{row.id}</BackTitle>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 sm:self-auto"
            >
              <IconTrash />
              Delete
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <dl className="divide-y divide-gray-100">
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[160px_1fr] sm:items-center sm:px-8">
                <dt className="text-sm font-semibold text-gray-900">Member</dt>
                <dd className="text-sm text-gray-800">{member.fullName}</dd>
              </div>
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[160px_1fr] sm:items-center sm:px-8">
                <dt className="text-sm font-semibold text-gray-900">Date</dt>
                <dd className="text-sm text-gray-800">{row.detailDate}</dd>
              </div>
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[160px_1fr] sm:items-center sm:px-8">
                <dt className="text-sm font-semibold text-gray-900">Status</dt>
                <dd className="text-sm text-gray-800">{row.status}</dd>
              </div>
              <div className="grid gap-1 px-6 py-4 sm:grid-cols-[160px_1fr] sm:items-start sm:px-8">
                <dt className="text-sm font-semibold text-gray-900">Feedback</dt>
                <dd className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{row.feedback}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
