"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PrototypeRoleProvider } from "./PrototypeRoleProvider";

const STORAGE_KEY = "lm_proto_auth";

const AuthContext = createContext(null);

function AuthRedirect({ to }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return <div className="min-h-screen bg-[#f0f1f3]" aria-hidden />;
}

export function usePrototypeAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("usePrototypeAuth must be used within PrototypeAuthProvider");
  }
  return ctx;
}

export function PrototypeAuthProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    try {
      setAuthenticated(sessionStorage.getItem(STORAGE_KEY) !== "0");
    } catch {
      setAuthenticated(true);
    }
    setReady(true);
  }, []);

  const login = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setAuthenticated(true);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "0");
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
    router.push("/auth/session/new");
  }, [router]);

  const value = useMemo(() => ({ authenticated, ready, login, logout }), [authenticated, ready, login, logout]);

  const onAuthRoute = pathname.startsWith("/auth/");
  const showAppContent = ready && ((!authenticated && onAuthRoute) || (authenticated && !onAuthRoute));

  return (
    <AuthContext.Provider value={value}>
      <PrototypeRoleProvider>
        {!ready ? <div className="min-h-screen bg-[#f0f1f3]" aria-busy="true" /> : null}
        {ready && !authenticated && !onAuthRoute ? <AuthRedirect to="/auth/session/new" /> : null}
        {ready && authenticated && onAuthRoute ? <AuthRedirect to="/dashboard" /> : null}
        {showAppContent ? children : null}
      </PrototypeRoleProvider>
    </AuthContext.Provider>
  );
}
