import { notFound } from "next/navigation";
import { getMemberById } from "../../../data";
import { AddFeedbackSummary } from "../../../AddFeedbackSummary";

export default async function AddFeedbackSummaryPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <AddFeedbackSummary member={member} />;
}
