import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongo";
import Item from "@/model/Item";

// app/item/[id]/archive/page.tsx


export default async function ArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await dbConnect();
  await Item.findByIdAndUpdate(id, { isArchived: true });

  redirect("/");
}