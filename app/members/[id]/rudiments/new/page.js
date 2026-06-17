import { notFound } from "next/navigation";
import { AddRudiment } from "../../../AddRudiment";
import { getMemberById } from "../../../data";

export default async function AddRudimentPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) notFound();
  return <AddRudiment member={member} />;
}
