import Link from "next/link";

function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-400" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/**
 * Breadcrumb row with the same book icon used on reminders and similar screens.
 *
 * @param {{ label: string, href?: string }[]} crumbs — omit `href` on the last item to show the current page (no link)
 */
export function PageBreadcrumb({ crumbs }) {
  return (
    <nav className="flex min-w-0 items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
      <IconBook />
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="text-gray-400">
                &gt;
              </span>
            ) : null}
            {c.href ? (
              <Link href={c.href} className="text-blue-600 hover:text-blue-700 hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
