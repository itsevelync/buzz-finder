import FoundItemForm from "@/components/report-item/FoundItemForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Found Item",
};

interface ItemPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditItem({ params }: ItemPageProps) {
    const { id } = await params;

    return <FoundItemForm id={id} />;
}
