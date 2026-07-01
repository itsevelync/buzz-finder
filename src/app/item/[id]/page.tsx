import { Metadata } from "next";
import ItemClient from "./ItemClient";
import { getItemNotes } from "@/actions/ItemNotes";

export const metadata: Metadata = {
    title: "Found Item",
};

interface ItemPageProps {
    params: {
        id: string;
    };
}

export default async function ItemPage({ params }: ItemPageProps) {
    const { id } = await params;

    const initialNotes = await getItemNotes(id);

    return <ItemClient id={id} initialNotes={initialNotes} />;
}
