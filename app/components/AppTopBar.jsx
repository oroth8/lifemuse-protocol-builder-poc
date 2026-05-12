"use client";

import Link from "next/link";

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export function AppTopBar({ onMenuClick, menuAriaLabel, menuExpanded, showNavToggle = true }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#e0e0e0] bg-white px-4">
      {showNavToggle ? (
        <button
          type="button"
          className="rounded-md p-2 text-gray-900 hover:bg-gray-100"
          aria-label={menuAriaLabel}
          aria-expanded={menuExpanded}
          onClick={onMenuClick}
        >
          <IconMenu />
        </button>
      ) : null}
      <Link href="/dashboard" className="font-sans text-lg font-semibold tracking-normal text-gray-900">
        LIFEMUSE
      </Link>
    </header>
  );
}
