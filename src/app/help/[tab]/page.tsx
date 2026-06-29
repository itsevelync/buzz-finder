import AboutClient from "./AboutClient";
import { Metadata } from "next";

type Tab = "about" | "contact" | "faq";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tab: Tab }>;
}): Promise<Metadata> {
    const { tab } = await params;

    const titles: Record<Tab, string> = {
        about: "About",
        contact: "Contact",
        faq: "FAQ",
    };

    return {
        title: `${titles[tab]}`,
        description: `${titles[tab]} page of BuzzFinder`,
    };
}

export default async function AboutAndSupportHub({
    params,
}: {
    params: Promise<{ tab: Tab }>;
}) {
    const { tab: activeTab } = await params;

    return <AboutClient activeTab={activeTab} />;
}
