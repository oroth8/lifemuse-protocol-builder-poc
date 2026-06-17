import { notFound } from "next/navigation";
import { getInboxThreadById, getThreadMessages } from "../messagesData";
import { ThreadView } from "../ThreadView";

export default async function MessageThreadPage({ params }) {
  const { threadId: raw } = await params;
  const threadId = decodeURIComponent(String(raw ?? ""));
  const meta = getInboxThreadById(threadId);
  if (!meta) notFound();
  const messages = getThreadMessages(threadId);

  return <ThreadView threadId={threadId} memberName={meta.memberName} messages={messages} />;
}
