import { notFound } from "next/navigation";
import { getMemberById } from "../../../data";
import { getProgressNoteById } from "../../../progressNotesMock";
import { ProgressNoteDetailView } from "../../../ProgressNoteDetailView";

export default async function ProgressNoteDetailPage({ params }) {
  const { id, noteId } = await params;
  const member = getMemberById(id);
  const note = getProgressNoteById(noteId);
  if (!member || !note) notFound();
  return <ProgressNoteDetailView member={member} note={note} />;
}
