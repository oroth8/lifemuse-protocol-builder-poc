import { notFound } from "next/navigation";
import { getMemberById } from "../../data";
import { ManageProgressNotes } from "../../ManageProgressNotes";

export default async function ManageProgressNotesPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <ManageProgressNotes member={member} />;
}
