import { dbConnect } from "@/lib/mongo";
import { notFound } from "next/navigation";
import LostItemPost, {
    LostItemPost as LostItemPostType,
} from "@/model/LostItemPost";
import LostItemPostForm from "@/components/post/LostItemPostForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Lost Item - BuzzFinder",
};

interface EditLostItemProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditLostItem({ params }: EditLostItemProps) {
    const { id } = await params;

    await dbConnect();
    const itemDoc = await LostItemPost.findById(id).lean();
    const item = itemDoc
        ? (JSON.parse(JSON.stringify(itemDoc)) as LostItemPostType)
        : undefined;

    if (!itemDoc) {
        notFound();
    }

    return <LostItemPostForm item={item} />;
}
