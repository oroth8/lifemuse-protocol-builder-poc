"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "lifemuse_prototype_role";
const PANEL_EXPANDED_KEY = "lifemuse_prototype_panel_expanded";

function IconChevronDown({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export const PROTOTYPE_ROLES = [
  { id: "concierge", roleLabel: "Concierge", firstName: "Stephen" },
  { id: "care_team", roleLabel: "Care Team Member", firstName: "Ellie" },
  { id: "designer", roleLabel: "The Designer", firstName: "NICO" },
];

const defaultRole = PROTOTYPE_ROLES[0];

const PrototypeRoleContext = createContext(null);

export function usePrototypeRole() {
  const ctx = useContext(PrototypeRoleContext);
  if (!ctx) {
    throw new Error("usePrototypeRole must be used within PrototypeRoleProvider");
  }
  return ctx;
}

function PrototypeRoleControls() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRoleId, roles } = usePrototypeRole();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PANEL_EXPANDED_KEY);
      if (raw === "0") setExpanded(false);
      if (raw === "1") setExpanded(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (pathname.startsWith("/auth")) {
    return null;
  }

  const toggleExpanded = () => {
    setExpanded((e) => {
      const next = !e;
      try {
        localStorage.setItem(PANEL_EXPANDED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] w-[min(100vw-2rem,220px)] rounded-lg border border-gray-200 bg-white shadow-md"
      role="region"
      aria-label="Prototype controls"
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E6980]">Prototype Controls</div>
          {!expanded ? (
            <div className="truncate text-xs font-medium text-gray-900" title={`${role.roleLabel} · ${role.firstName}`}>
              {role.firstName} · {role.roleLabel}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#2d2d2d]"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse prototype panel" : "Expand prototype panel"}
        >
          <IconChevronDown className={`transition-transform duration-200 ${expanded ? "rotate-0" : "rotate-180"}`} />
        </button>
      </div>
      {expanded ? (
        <div className="space-y-2 p-3">
          {roles.map((r) => {
            const selected = r.id === role.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRoleId(r.id);
                  if (r.id === "designer") {
                    router.push("/design-system");
                  }
                }}
                className={`flex w-full flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selected
                    ? "border-[#2d2d2d]/40 bg-[#2d2d2d]/10 text-gray-900"
                    : "border-gray-100 bg-gray-50/80 text-gray-700 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium text-gray-900">{r.roleLabel}</span>
                <span className="text-xs text-gray-500">&ldquo;{r.firstName}&rdquo;</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function PrototypeRoleProvider({ children }) {
  const [roleId, setRoleIdState] = useState(defaultRole.id);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && PROTOTYPE_ROLES.some((r) => r.id === stored)) {
        setRoleIdState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setRoleId = (id) => {
    setRoleIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const role = useMemo(() => PROTOTYPE_ROLES.find((r) => r.id === roleId) ?? defaultRole, [roleId]);

  const value = useMemo(() => ({ role, setRoleId, roles: PROTOTYPE_ROLES }), [role, setRoleId]);

  return (
    <PrototypeRoleContext.Provider value={value}>
      {children}
      <PrototypeRoleControls />
    </PrototypeRoleContext.Provider>
  );
}
