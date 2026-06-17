"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrototypeAuth } from "./PrototypeAuthProvider";
import { useEffect, useState } from "react";
import { AppTopBar } from "./AppTopBar";

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

function IconPrograms({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function IconItems({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function IconCategories({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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
  { href: "/messages", label: "Messages", Icon: IconMessage, badge: "Out of Scope" },
  { href: "/programs", label: "Programs", Icon: IconPrograms },
  { href: "/items", label: "Items", Icon: IconItems },
  { href: "/categories", label: "Categories", Icon: IconCategories },
];

export function AppShell({ children, mainClassName, hideSidebar = false, hideTopBar = false }) {
  const pathname = usePathname();
  const { logout } = usePrototypeAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLg(mq.matches);
    const onChange = () => setIsLg(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggleNav() {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarCollapsed((c) => !c);
    } else {
      setMobileNavOpen((o) => !o);
    }
  }

  const menuAriaLabel = isLg
    ? sidebarCollapsed
      ? "Expand navigation menu"
      : "Collapse navigation menu"
    : mobileNavOpen
      ? "Close navigation menu"
      : "Open navigation menu";

  const menuExpanded = isLg ? !sidebarCollapsed : mobileNavOpen;
  const railMode = sidebarCollapsed && isLg;

  return (
    <div className="flex min-h-screen flex-col">
      {!hideTopBar ? (
        <AppTopBar
          onMenuClick={toggleNav}
          menuAriaLabel={menuAriaLabel}
          menuExpanded={menuExpanded}
          showNavToggle={!hideSidebar}
        />
      ) : null}
      <div className="relative flex min-h-0 min-w-0 flex-1">
        {!hideSidebar && mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 top-14 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
        {!hideSidebar ? (
          <aside
            className={`fixed top-14 bottom-0 z-50 flex shrink-0 flex-col bg-black py-6 text-white transition-[width,transform,padding] duration-200 ease-out lg:relative lg:top-auto lg:bottom-auto lg:z-auto lg:min-h-0 lg:translate-x-0 ${
              sidebarCollapsed ? "w-[248px] px-4 lg:w-[72px] lg:px-2" : "w-[248px] px-4"
            } ${mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          >
            <nav className="flex flex-1 flex-col gap-1 pt-1">
              {NAV.map(({ href, label, Icon, badge }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                const colorClass = active ? "" : "text-white/90";
                const style = active ? { color: ACCENT } : undefined;
                return (
                  <Link
                    key={href}
                    href={href}
                    title={railMode ? (badge ? `${label} (${badge})` : label) : undefined}
                    className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-white/5 ${railMode ? "justify-center gap-0 px-2" : "min-w-0 gap-3 px-3"} ${active ? "bg-[#d4a853]/14 shadow-[inset_0_0_12px_rgba(212,168,83,0.12)]" : ""} ${colorClass}`}
                    style={style}
                  >
                    <Icon className="shrink-0" style={active ? { color: ACCENT } : { color: "rgba(255,255,255,0.9)" }} />
                    <span className={`min-w-0 flex-1 truncate ${railMode ? "sr-only" : ""}`}>{label}</span>
                    {badge && !railMode ? (
                      <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-white/85">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              title={railMode ? "Sign Out" : undefined}
              onClick={logout}
              className={`mt-auto flex items-center rounded-lg py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/5 ${railMode ? "justify-center px-2" : "gap-3 px-3 text-left"}`}
            >
              <IconSignOut className="shrink-0 text-white/90" />
              <span className={railMode ? "sr-only" : ""}>Sign Out</span>
            </button>
          </aside>
        ) : null}
        <main className={`min-h-0 min-w-0 flex-1 ${mainClassName ?? ""}`}>{children}</main>
      </div>
    </div>
  );
}
