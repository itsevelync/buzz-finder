import EditItemClient from "./EditItemClient";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import type { Item } from "@/model/Item";
import ItemModel from "@/model/Item";

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
    const item = itemDoc ? JSON.parse(JSON.stringify(itemDoc)) as Item : null;
    return <EditItemClient userId={session?.user?._id} itemId={id} item={item} />;
}
