import LostItemForm from "@/components/report-item/LostItemForm";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import ItemModel, { PlainItem } from "@/model/Item";
import { notFound } from "next/navigation";

interface ItemPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditItem({ params }: ItemPageProps) {
    const { id } = await params;
    const session = await auth();
    await dbConnect();
    const itemDoc = await ItemModel.findById(id).lean();
    const item = itemDoc
        ? (JSON.parse(JSON.stringify(itemDoc)) as PlainItem)
        : undefined;

    if (!itemDoc) {
        notFound();
    }

    return <LostItemForm userId={session?.user?._id} item={item} />;
}
