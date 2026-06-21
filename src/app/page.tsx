import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "BuzzFinder",
    description:
        "Lost something? Found something? BuzzFinder helps you report, map, and track lost and found items in your community to quickly reunite them with owners.",
};

export default async function Home() {
    redirect("map");
}
