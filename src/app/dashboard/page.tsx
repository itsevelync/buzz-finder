import { Suspense } from 'react';
import LostFoundDashboardContainer from "@/components/dashboard/LostFoundDashboardContainer";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Dashboard - BuzzFinder",
};

export default async function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LostFoundDashboardContainer />
        </Suspense>
    );
}
