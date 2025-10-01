
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LostFoundSelector from "@/components/dashboard/LostFoundSelector";
import React from "react";
import LostFoundDashboardContainer from "@/components/dashboard/LostFoundDashboardContainer";

export default async function Home() {
    const session = await auth();

    if (!session?.user) redirect("/login");


    return (
        <LostFoundDashboardContainer/>);
}