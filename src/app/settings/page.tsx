import SettingsClient from "./SettingsClient";

export default async function Settings({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;

    return <SettingsClient initialTab={tab ?? "general"} />;
}
