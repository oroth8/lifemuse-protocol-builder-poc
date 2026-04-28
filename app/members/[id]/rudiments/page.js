import { notFound } from "next/navigation";
import { getMemberById } from "../../data";
import { ManageRudiments } from "../../ManageRudiments";

export default async function ManageRudimentsPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <ManageRudiments member={member} />;
}
