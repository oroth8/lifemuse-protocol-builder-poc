import { notFound } from "next/navigation";
import { getMemberById } from "../../data";
import { ManageFeedbackSummary } from "../../ManageFeedbackSummary";

export default async function ManageFeedbackSummaryPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <ManageFeedbackSummary member={member} />;
}
