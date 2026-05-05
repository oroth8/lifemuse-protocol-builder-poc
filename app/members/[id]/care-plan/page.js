import { notFound } from "next/navigation";
import { getCarePlanRowsForMember } from "../../carePlanMock";
import { getMemberById } from "../../data";
import { ManageCarePlan } from "../../ManageCarePlan";

export default async function ManageCarePlanPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  const rows = getCarePlanRowsForMember(member.id);
  return <ManageCarePlan member={member} rows={rows} />;
}
