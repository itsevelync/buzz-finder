import LostItemClient from "./LostItemClient";
import { Metadata } from "next";
import { getItemNotes } from "@/actions/ItemNotes";

export const metadata: Metadata = {
    title: "Lost Item",
};

export default async function LostItemPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;

    const initialNotes = await getItemNotes(id);

    return <LostItemClient id={id} initialNotes={initialNotes} />;
}
