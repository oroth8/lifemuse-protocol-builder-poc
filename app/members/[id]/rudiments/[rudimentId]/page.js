import { notFound } from "next/navigation";
import { getMemberById } from "../../../data";
import { getRudimentById } from "../../../rudimentsMock";
import { RudimentDetailView } from "../../../RudimentDetailView";

export default async function RudimentDetailPage({ params }) {
  const { id, rudimentId } = await params;
  const member = getMemberById(id);
  const rudiment = getRudimentById(rudimentId);
  if (!member || !rudiment) notFound();
  return <RudimentDetailView member={member} rudiment={rudiment} />;
}
