import { AppShell } from "../../components/AppShell";
import { CreateCategoryClient } from "../CreateCategoryClient";

export default function CreateCategoryPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <CreateCategoryClient />
    </AppShell>
  );
}
