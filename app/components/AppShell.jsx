"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconHome({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconBell({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function IconGrid({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function IconUsers({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMessage({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconSignOut({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

const ACCENT = "#d4a853";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: IconHome },
  { href: "/reminders", label: "Reminders", Icon: IconBell },
  { href: "/protocols", label: "Protocols", Icon: IconGrid },
  { href: "/members", label: "Members", Icon: IconUsers },
  { href: "/messages", label: "Messages", Icon: IconMessage },
];

export function AppShell({ children, mainClassName }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[248px] shrink-0 flex-col bg-black px-4 py-6 text-white">
        <Link href="/dashboard" className="mb-10 block px-2">
          <span className="font-sans text-xl font-semibold tracking-[0.2em] text-white">LIFEMUSE</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            const colorClass = active ? "" : "text-white/90";
            const style = active ? { color: ACCENT } : undefined;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 ${active ? "bg-[#d4a853]/14 shadow-[inset_0_0_12px_rgba(212,168,83,0.12)]" : ""} ${colorClass}`}
                style={style}
              >
                <Icon className="shrink-0" style={active ? { color: ACCENT } : { color: "rgba(255,255,255,0.9)" }} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/5"
        >
          <IconSignOut className="shrink-0 text-white/90" />
          Sign Out
        </button>
      </aside>
      <main className={mainClassName}>{children}</main>
    </div>
  );
}
