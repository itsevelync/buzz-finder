import { Metadata } from "next";
import ItemClient from "./ItemClient";

export const metadata: Metadata = {
    title: "Found Item - BuzzFinder",
};

interface ItemPageProps {
    params: {
        id: string;
    };
}

export default async function ItemPage({ params }: ItemPageProps) {
    params = await params;

    return <ItemClient id={params.id} />;
}
