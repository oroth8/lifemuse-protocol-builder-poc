import { AppShell } from "../../../components/AppShell";
import { getItemById } from "../../itemsData";
import { EditItemClient } from "../../EditItemClient";

export default async function EditItemPage({ params }) {
  const { id } = await params;
  const serverItem = getItemById(id);

  return (
    <AppShell hideSidebar hideTopBar mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <EditItemClient itemId={id} serverItem={serverItem} />
    </AppShell>
  );
}
