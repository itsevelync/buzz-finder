"use client";

import { useState, useEffect, useRef } from "react";
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
    LuChevronDown,
} from "react-icons/lu";

export default function AboutClient({
    activeTab,
}: {
    activeTab: "about" | "contact" | "faq";
}) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigationTabs = [
        { tab: "about", label: "About", icon: LuInfo },
        { tab: "contact", label: "Contact Us", icon: LuMessageSquare },
        { tab: "faq", label: "FAQ", icon: LuCircleHelp },
    ] as const;

    const currentTabConfig =
        navigationTabs.find((t) => t.tab === activeTab) || navigationTabs[0];
    const ActiveIcon = currentTabConfig.icon;

    function handleTabChange(tab: "about" | "contact" | "faq") {
        router.push(tab);
        setIsDropdownOpen(false);
    }

    useEffect(() => {
        // Close if clicked outside of the container
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        // Close if the screen size stretches to desktop widths
        const handleResize = () => {
            if (window.innerWidth >= 640) {
                setIsDropdownOpen(false);
            }
        };

        // Attach listeners
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleResize);

        // Clean up listeners on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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

            {/* Navigation Section */}
            <div className="sticky top-0 w-full max-w-sm sm:max-w-none mx-auto sm:mx-0 flex justify-center py-4 px-8 z-50">
                {/* Mobile Dropdown */}
                <div ref={dropdownRef} className="relative w-full sm:hidden">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between gap-2 px-6 py-3
                            border border-foreground/10 bg-background shadow-md rounded-2xl
                            font-medium transition-all text-foreground"
                    >
                        <span className="flex items-center gap-2">
                            <ActiveIcon size={18} className="text-buzz-gold" />
                            {currentTabConfig.label}
                        </span>
                        <LuChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Popover Dropdown Drawer */}
                    {isDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-2 p-1.5 bg-background border border-foreground/10 rounded-2xl shadow-xl z-50 flex flex-col gap-1">
                            {navigationTabs.map((tab) => {
                                const TabIcon = tab.icon;
                                const isCurrent = activeTab === tab.tab;
                                return (
                                    <button
                                        key={tab.tab}
                                        onClick={() => handleTabChange(tab.tab)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                            isCurrent
                                                ? "bg-buzz-gold text-background shadow-sm"
                                                : "text-foreground/80 hover:bg-foreground/5"
                                        }`}
                                    >
                                        <TabIcon size={16} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Desktop Tabs */}
                <nav
                    className="hidden sm:flex p-1.5 w-auto rounded-full border border-foreground/10 
                        bg-background shadow-sm min-w-[70%] gap-2"
                >
                    {navigationTabs.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.tab}
                                onClick={() => handleTabChange(tab.tab)}
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
                className="pt-6 pb-8 px-6 flex-wrap border-t border-foreground/10 mt-3
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
