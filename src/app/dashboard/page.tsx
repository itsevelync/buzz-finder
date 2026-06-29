import { Suspense } from "react";
import LostFoundDashboardContainer from "@/components/dashboard/LostFoundDashboardContainer";
import { Metadata } from "next";
import Loading from "../loading";

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "Search and filter reported lost and found items.",
};

export default async function Home() {
    return (
        <Suspense fallback={<Loading />}>
            <LostFoundDashboardContainer />
        </Suspense>
    );
}
