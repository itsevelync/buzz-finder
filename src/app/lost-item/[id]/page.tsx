import { auth } from "@/auth";
import LostItemClient from "./LostItemClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lost Item - BuzzFinder",
};

export default async function LostItemPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const session = await auth();

    return <LostItemClient id={id} session={session} />;
}
