import AboutClient from "./AboutClient";

export default async function AboutAndSupportHub({
    params,
}: {
    params: { tab: "about" | "contact" | "faq" };
}) {
    const { tab: activeTab } = await params;

    return <AboutClient activeTab={activeTab} />;
}
