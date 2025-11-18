import { Suspense } from 'react';
import LostFoundDashboardContainer from "@/components/dashboard/LostFoundDashboardContainer";

export default async function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LostFoundDashboardContainer />
        </Suspense>
    );
}
