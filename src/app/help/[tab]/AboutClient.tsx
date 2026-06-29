"use client";

import AboutTab from "@/components/about/AboutTab";
import ContactTab from "@/components/about/ContactTab";
import FAQTab from "@/components/about/FAQTab";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    LuInfo,
    LuMessageSquare,
    LuCircleHelp,
    LuHeart,
    LuCoffee,
} from "react-icons/lu";

export default function AboutClient({
    activeTab,
}: {
    activeTab: "about" | "contact" | "faq";
}) {
    const router = useRouter();

    const navigationTabs = [
        { tab: "about", label: "About", icon: LuInfo },
        { tab: "contact", label: "Contact Us", icon: LuMessageSquare },
        { tab: "faq", label: "FAQ", icon: LuCircleHelp },
    ];

    function handleTabChange(tab: "about" | "contact" | "faq") {
        router.push(tab);
    }

    return (
        <div className="min-h-full bg-foreground/2">
            {/* Hero Section */}
            <header className="pt-16 pb-6 sm:pb-10 px-6 text-center">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 relative z-10">
                    <div
                        className="w-20 h-20 rounded-2xl shadow-xl border border-foreground/20
                            hover:rotate-12 transition-transform"
                    >
                        <Image
                            src="/images/buzzfinder-logo.png"
                            alt="BuzzFinder"
                            className="w-full h-full object-contain"
                            width={100}
                            height={100}
                        />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-semibold text-buzz-blue">
                        Welcome to BuzzFinder
                    </h1>
                    <p className="sm:text-lg md:text-xl text-foreground/80 max-w-3xl">
                        We lose things all the time, and we&rsquo;re on a
                        mission to reconnect people like us with the things that
                        matter to them.
                    </p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="sticky top-0 flex justify-center p-4 z-50">
                <nav
                    className="flex flex-col sm:flex-row p-1.5 w-full sm:w-auto rounded-3xl
                        sm:rounded-full border border-foreground/10 bg-background shadow-sm min-w-[70%] gap-2"
                >
                    {navigationTabs.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.tab}
                                onClick={() =>
                                    handleTabChange(
                                        tab.tab as "about" | "contact" | "faq",
                                    )
                                }
                                className={`flex-nowrap whitespace-nowrap flex-1 justify-center flex items-center
                                        gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                                            activeTab === tab.tab
                                                ? "bg-buzz-gold text-background shadow-md"
                                                : "text-foreground/80 hover:text-foreground/50"
                                        }`}
                            >
                                <TabIcon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Pages */}
            <main className="max-w-5xl mx-auto px-4 py-12">
                {/* About Page */}
                {activeTab === "about" && <AboutTab />}

                {/* Contact Form */}
                {activeTab === "contact" && <ContactTab />}

                {/* FAQ */}
                {activeTab === "faq" && <FAQTab />}
            </main>

            {/* Footer*/}
            <footer
                className="pt-6 pb-8 px-4 flex-wrap border-t border-foreground/10 mt-3
                    text-sm text-foreground/60 flex items-center gap-x-2 gap-y-1 justify-center"
            >
                <span>© {new Date().getFullYear()}</span> Made with
                <LuHeart className="inline-flex align-middle" />
                and
                <LuCoffee className="inline-flex align-middle" />
                by the BuzzFinder team.
            </footer>
        </div>
    );
}
