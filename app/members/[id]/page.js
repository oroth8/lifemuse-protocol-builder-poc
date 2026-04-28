import { notFound } from "next/navigation";
import { getMemberById } from "../data";
import { MemberDetail } from "../MemberDetail";

export default async function MemberProfilePage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <MemberDetail member={member} />;
}
