import { notFound } from "next/navigation";
import { getMemberById } from "../../../data";
import { AddProgressNote } from "../../../AddProgressNote";

export default async function AddProgressNotePage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <AddProgressNote member={member} />;
}
