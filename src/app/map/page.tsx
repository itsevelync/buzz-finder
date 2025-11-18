import type { Metadata } from "next";
import MapClient from "./MapClient";
import { dbConnect } from "@/lib/mongo";

export const metadata: Metadata = {
    title: "Map - BuzzFinder",
    description: "An interactive map displaying lost items",
};

interface SearchParams {
    [key: string]: string | string[] | undefined;
}

export default async function Map({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    searchParams = await searchParams;
    const itemId = (searchParams.itemId as string) ?? null;
    
    await dbConnect();
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/item`, {
        method: "GET",
    });

    if (!res.ok) {
        console.error(`Failed to fetch item: ${res.status} ${res.statusText}`);
        return null;
    }

    const items = await res.json();

    return <MapClient itemId={itemId} items={items} />;
}
