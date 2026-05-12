"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { PageBreadcrumb } from "../components/PageBreadcrumb";
import { findItemInClientSnapshot, getItemById, normalizeItemForForm } from "./itemsData";
import { ItemFormClient } from "./ItemFormClient";

/**
 * @param {{ itemId: string, serverItem: { id: number, itemName: string, itemTypeKey: string, pillarKey: string } | null }} props
 */
export function EditItemClient({ itemId, serverItem }) {
  const [resolved, setResolved] = useState(() => serverItem ?? getItemById(itemId) ?? findItemInClientSnapshot(itemId));

  useLayoutEffect(() => {
    if (serverItem) {
      setResolved(serverItem);
      return;
    }
    setResolved(findItemInClientSnapshot(itemId) ?? getItemById(itemId));
  }, [itemId, serverItem]);

  if (!resolved) {
    return (
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageBreadcrumb crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Items", href: "/items" }, { label: "Not found" }]} />
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">Item not found</h1>
            <p className="mt-2 text-sm text-gray-600">This item may have been removed or the link is invalid.</p>
            <Link href="/items" className="btn-lifemuse-primary mt-6 inline-flex">
              Back to Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ItemFormClient key={resolved.id} mode="edit" itemId={resolved.id} initialValues={normalizeItemForForm(resolved)} />;
}
