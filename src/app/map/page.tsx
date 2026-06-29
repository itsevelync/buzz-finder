import type { Metadata } from "next";
import MapClient from "./MapClient";

export const metadata: Metadata = {
    title: "Map",
    description: "An interactive map displaying lost items.",
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

    return <MapClient itemId={itemId} />;
}
