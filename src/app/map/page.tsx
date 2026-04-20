import type { Metadata } from "next";
import MapClient from "./MapClient";
import { dbConnect } from "@/lib/mongo";
import { getActiveItems } from "@/actions/ItemFilter";

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
    const items = await getActiveItems();

    return <MapClient itemId={itemId} items={items} />;
}
