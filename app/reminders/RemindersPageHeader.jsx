import Link from "next/link";

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/**
 * @param {{ label: string, href?: string }[]} crumbs — last item is current page (no href)
 */
export function RemindersPageHeader({ crumbs }) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-4 border-b border-black/5 bg-white px-6 py-4">
      <nav className="flex min-w-0 flex-1 items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
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
      <div className="ml-auto flex w-full max-w-md justify-end sm:w-auto sm:max-w-xs">
        <label className="relative w-full">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="search"
            placeholder="Search"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
          />
        </label>
      </div>
    </header>
  );
}
