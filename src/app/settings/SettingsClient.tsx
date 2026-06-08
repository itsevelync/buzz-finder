"use client";

import Logout from "@/components/auth/Logout";
import { useState } from "react";
import ProfileSettings from "@/components/profile/ProfileSettings";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import SecuritySettings from "@/components/profile/SecuritySettings";

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
            <div className="mx-auto max-w-5xl px-6 py-10">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Manage your account preferences and security.
                        </p>
                    </div>

                    {user && (
                        <Logout className="rounded-lg bg-buzz-blue px-4 py-2 text-white transition hover:opacity-90" />
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    {/* Tabs */}
                    <div className="border-b border-neutral-200">
                        <nav className="flex">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`border-b-2 px-6 py-4 text-sm font-medium transition ${
                                        activeTab === tab.id
                                            ? "border-buzz-gold text-buzz-blue"
                                            : "border-transparent text-neutral-500 hover:text-foreground"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
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

                                {user && (
                                    <section>
                                        <h2 className="mb-4 text-lg font-semibold">
                                            Notifications
                                        </h2>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 opacity-70">
                                                <div className="w-3/4">
                                                    <span className="font-medium">
                                                        Marketing Updates
                                                    </span>

                                                    <p className="text-sm text-neutral-500">
                                                        Receive occasional
                                                        emails from the
                                                        BuzzFinder team with
                                                        site updates and other
                                                        fun things.
                                                    </p>

                                                    <p className="mt-1 text-xs text-buzz-gold italic">
                                                        Coming soon!
                                                    </p>
                                                </div>
                                                <input
                                                    disabled
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="h-5 w-5 accent-buzz-gold cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                )}
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
