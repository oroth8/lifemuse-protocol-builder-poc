import { notFound } from "next/navigation";
import { getCarePlanItemById } from "../../../../carePlanMock";
import { getMemberById } from "../../../../data";
import { EditCarePlanItem } from "../../../../EditCarePlanItem";

export default async function EditCarePlanItemPage({ params }) {
  const { id, itemId } = await params;
  const member = getMemberById(id);
  const item = getCarePlanItemById(itemId);
  if (!member || !item) notFound();
  return <EditCarePlanItem member={member} item={item} />;
}
