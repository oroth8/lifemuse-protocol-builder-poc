import { AppShell } from "../../components/AppShell";
import { ProgramFormClient } from "../ProgramFormClient";

export default function NewProgramPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <ProgramFormClient mode="create" initialProgramName="Vegan" initialPillarKey="nutrition" />
    </AppShell>
  );
}
