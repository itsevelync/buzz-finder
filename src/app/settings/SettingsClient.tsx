"use client";

import Logout from "@/components/auth/Logout";
import { useState } from "react";
import ProfileSettings from "@/components/profile/ProfileSettings";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import SecuritySettings from "@/components/profile/SecuritySettings";
import NotificationSettings from "@/components/profile/NotificationSettings";

interface SettingsClientProps {
    initialTab: string;
}

export default function SettingsClient({ initialTab }: SettingsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user } = useUser();

    const tabs = user
        ? [
              { id: "general", label: "General" },
              { id: "profile", label: "Profile" },
              { id: "security", label: "Security" },
          ]
        : [{ id: "general", label: "General" }];
    const [activeTab, setActiveTab] = useState(initialTab);
    const [darkMode, setDarkMode] = useState(false);

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set("tab", tabId);

        router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
        });

        setActiveTab(tabId);
    };
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="mx-auto max-w-5xl pt-6 pb-4 md:pt-8 md:pb-6">
                {/* Header */}
                <div className="mb-7 px-5 sm:px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-buzz-blue mb-2">Settings</h1>
                        <p className="mt-1 text-foreground/70">
                            Manage your account preferences and security.
                        </p>
                    </div>

                    {user && (
                        <Logout className="rounded-md bg-buzz-blue px-4 py-2 text-white transition hover:opacity-90" />
                    )}
                </div>

                <div className="">
                    {/* Tabs */}
                    <div className="z-1 sticky top-0 px-2 border-b border-foreground/15 shadow-sm lg:shadow-none bg-background pt-1">
                        <nav className="flex gap-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`border-b-2 px-6 py-3 font-medium transition ${
                                        activeTab === tab.id
                                            ? "border-buzz-blue text-buzz-blue"
                                            : "border-transparent text-foreground/40 hover:text-foreground"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* GENERAL */}
                        {/* GENERAL */}
                        {activeTab === "general" && (
                            <div className="space-y-8">
                                <section>
                                    <h2 className="mb-4 text-lg font-semibold">
                                        General Preferences
                                    </h2>
                                    <div className="grid gap-6 md:grid-cols-1">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                College
                                            </label>
                                            <select className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-buzz-gold focus:outline-none">
                                                <option>
                                                    Georgia Institute of
                                                    Technology
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="mb-4 text-lg font-semibold">
                                        Appearance
                                    </h2>

                                    <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 opacity-70">
                                        <div className="w-3/4">
                                            <p className="font-medium">
                                                Dark Mode
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                Toggle between light and dark
                                                themes.
                                            </p>

                                            <p className="mt-1 text-xs text-buzz-gold italic">
                                                Coming soon!
                                            </p>
                                        </div>

                                        <button
                                            disabled
                                            onClick={() =>
                                                setDarkMode(!darkMode)
                                            }
                                            className={`relative h-7 w-12 rounded-full transition cursor-not-allowed ${
                                                darkMode
                                                    ? "bg-buzz-blue"
                                                    : "bg-neutral-300"
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                                                    darkMode
                                                        ? "left-6"
                                                        : "left-1"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </section>

                                {user && <NotificationSettings user={user} />}
                            </div>
                        )}

                        {/* PROFILE */}
                        {activeTab === "profile" && <ProfileSettings />}

                        {/* SECURITY */}
                        {activeTab === "security" && <SecuritySettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}
