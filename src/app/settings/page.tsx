import SettingsClient from "./SettingsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
};

export default async function Settings({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;

    return <SettingsClient initialTab={tab ?? "general"} />;
}
