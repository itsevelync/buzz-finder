import FoundItemForm from "@/components/report-item/FoundItemForm";
import { dbConnect } from "@/lib/mongo";
import ItemModel, { PlainItem } from "@/model/Item";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Found Item - BuzzFinder",
};

interface ItemPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditItem({ params }: ItemPageProps) {
    const { id } = await params;

    await dbConnect();
    const itemDoc = await ItemModel.findById(id).lean();
    const item = itemDoc
        ? (JSON.parse(JSON.stringify(itemDoc)) as PlainItem)
        : undefined;

    if (!itemDoc) {
        notFound();
    }

    return <FoundItemForm item={item} />;
}
