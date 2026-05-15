"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CREATE_ITEM_PILLAR_ORDER, PILLAR_META } from "../categories/categoriesData";

function IconChevronDown({ className, open }) {
  return (
    <svg
      className={`${className ?? ""} shrink-0 transition-transform duration-200`}
      style={{ transform: open ? "rotate(180deg)" : undefined }}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * Charcoal trigger + pillar menu (Items list). Pass `onSelectPillar` to override navigation (e.g. design system demo).
 *
 * @param {{
 *   triggerLabel?: string,
 *   menuId?: string,
 *   triggerId?: string,
 *   pillarKeys?: readonly (keyof typeof PILLAR_META)[],
 *   onSelectPillar?: (pillarKey: string) => void,
 * }} [props]
 */
export function CreateItemPillarMenu({
  triggerLabel = "Create Item",
  menuId = "create-item-pillar-menu",
  triggerId = "create-item-pillar-trigger",
  pillarKeys = CREATE_ITEM_PILLAR_ORDER,
  onSelectPillar,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(/** @type {Node} */ (e.target))) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (pillarKey) => {
    setOpen(false);
    if (onSelectPillar) {
      onSelectPillar(pillarKey);
      return;
    }
    router.push(`/items/new?pillar=${encodeURIComponent(pillarKey)}`);
  };

  return (
    <div className="relative shrink-0 self-start sm:self-center" ref={wrapRef}>
      <button
        type="button"
        className={`inline-flex min-w-[148px] items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d2d2d] ${open ? "rounded-t-lg rounded-b-none" : "rounded-lg"} bg-[#2d2d2d] hover:bg-[#3a3a3a]`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        id={triggerId}
        onClick={() => setOpen((v) => !v)}
      >
        {triggerLabel}
        <IconChevronDown open={open} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className="absolute left-0 right-0 top-full z-50 overflow-hidden rounded-b-lg rounded-t-none border border-t-0 border-gray-200/90 bg-[#eef2f9] shadow-md sm:left-auto sm:min-w-[220px] sm:max-w-none"
        >
          {pillarKeys.map((key) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-[#2563eb] hover:text-white focus-visible:bg-[#2563eb] focus-visible:text-white focus-visible:outline-none"
              onClick={() => go(key)}
            >
              {PILLAR_META[key]?.label ?? key}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
