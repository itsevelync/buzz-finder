import LostItemPostForm from "@/components/post/LostItemPostForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Lost Item",
};

interface EditLostItemProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditLostItem({ params }: EditLostItemProps) {
    const { id } = await params;

    return <LostItemPostForm id={id} />;
}
