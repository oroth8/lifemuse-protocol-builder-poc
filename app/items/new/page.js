import { AppShell } from "../../components/AppShell";
import { PILLAR_TAG_ORDER } from "../../categories/categoriesData";
import { ItemFormClient } from "../ItemFormClient";
import { EMPTY_ITEM_FORM_VALUES } from "../itemsData";

export default async function NewItemPage({ searchParams }) {
  const sp = await searchParams;
  const raw = sp?.pillar;
  const pillarKey =
    typeof raw === "string" && /** @type {readonly string[]} */ (PILLAR_TAG_ORDER).includes(raw) ? raw : EMPTY_ITEM_FORM_VALUES.pillarKey;

  const supplementDefaults =
    pillarKey === "supplements"
      ? { itemTypeKey: "system_formula", route: "oral", supplementRecurrenceType: "daily" }
      : {};

  const recoveryDefaults =
    pillarKey === "recovery" ? { itemTypeKey: "session", recoverySessionCategory: "all_categories" } : {};

  const regenerationDefaults =
    pillarKey === "regeneration" ? { itemTypeKey: "session", regenerationSessionCategory: "all_categories" } : {};

  return (
    <AppShell hideSidebar hideTopBar mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <ItemFormClient
        key={pillarKey}
        mode="create"
        initialValues={{
          ...EMPTY_ITEM_FORM_VALUES,
          pillarKey,
          ...supplementDefaults,
          ...recoveryDefaults,
          ...regenerationDefaults,
        }}
      />
    </AppShell>
  );
}
