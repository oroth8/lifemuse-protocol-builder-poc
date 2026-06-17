import { notFound } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { getProgramById } from "../../programsData";
import { ProgramFormClient } from "../../ProgramFormClient";

export default async function EditProgramPage({ params }) {
  const { id } = await params;
  const program = getProgramById(id);
  if (!program) notFound();

  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <ProgramFormClient mode="edit" initialProgramName={program.programName} initialPillarKey={program.pillarKey} />
    </AppShell>
  );
}
