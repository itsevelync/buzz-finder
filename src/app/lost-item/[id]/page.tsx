import { dbConnect } from "@/lib/mongo";
import { LostItemPost } from "@/model/LostItemPost";
import Link from "next/link";
import { auth } from "@/auth";
import LostItemClient from "./LostItemClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lost Item - BuzzFinder",
};

async function getLostItem(id: string): Promise<LostItemPost | null> {
    try {
        await dbConnect();
        const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/lost-item-posts/${id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            },
        );

        if (!res.ok) {
            console.error(
                `Failed to fetch item: ${res.status} ${res.statusText}`,
            );
            return null;
        }

        const data = await res.json();
        return data.item;
    } catch (error) {
        console.error("Error fetching item:", error);
        return null;
    }
}

export default async function LostItemPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const lost_item = (await getLostItem(id)) as LostItemPost;

    if (!lost_item) {
        return (
            <div className="p-8 text-center max-w-xl m-auto h-full justify-center flex flex-col">
                <h2 className="text-2xl font-bold text-foreground">
                    Item Not Found
                </h2>
                <p className="text-foreground/80 mt-2">
                    The item post you are looking for may have been deleted or
                    resolved.
                </p>
                <Link
                    href="/dashboard?tab=lost"
                    className="mt-4 inline-block text-buzz-blue hover:underline"
                >
                    Return to dashboard
                </Link>
            </div>
        );
    }

    const session = await auth();

    return (
        <LostItemClient lost_item={lost_item} session={session} />
    );
}