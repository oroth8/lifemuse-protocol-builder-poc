import { notFound } from "next/navigation";
import { getMemberById } from "../../../data";
import { getFeedbackSummaryById } from "../../../feedbackSummaryMock";
import { FeedbackSummaryDetailView } from "../../../FeedbackSummaryDetailView";

export default async function FeedbackSummaryDetailPage({ params }) {
  const { id, feedbackId } = await params;
  const member = getMemberById(id);
  const row = getFeedbackSummaryById(feedbackId);
  if (!member || !row) notFound();
  return <FeedbackSummaryDetailView member={member} row={row} />;
}
