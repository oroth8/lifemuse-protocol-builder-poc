"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { readUserProtocols } from "../lib/userProtocols";
import { BASE_PROTOCOLS } from "./baseProtocols";
import { ProtocolsTable } from "./ProtocolsTable";

export function ProtocolsPageContent() {
  const [userRows, setUserRows] = useState([]);

  useEffect(() => {
    setUserRows(readUserProtocols());
  }, []);

  const rows = useMemo(() => [...userRows, ...BASE_PROTOCOLS], [userRows]);

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
              <li className="font-medium text-gray-600">Protocols</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Protocols</h1>
              <p className="mt-1 text-sm text-gray-600">Manage protocol templates and open the builder to create new ones.</p>
            </div>
            <Link href="/protocol-builder" className="btn-lifemuse-primary">
              Build new protocol
            </Link>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <ProtocolsTable rows={rows} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
