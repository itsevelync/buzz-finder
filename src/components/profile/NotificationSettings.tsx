"use client";

import { useState, useEffect } from "react";
import { updateNotificationPreferences } from "@/actions/Notification";
import { subscribeUser } from "@/actions/Push";
import { urlBase64ToUint8Array } from "@/lib/push";
import { UserContextUser } from "@/context/UserContext";
import { NotificationPreferences } from "@/model/User";

interface NotificationSettingsProps {
    user: UserContextUser;
}

export default function NotificationSettings({
    user,
}: NotificationSettingsProps) {
    const prefs: NotificationPreferences = user?.notificationPreferences || {};

    // Local UI State mapped to your Mongoose UserSchema
    const [settings, setSettings] = useState({
        pushEnabled: prefs.pushEnabled ?? false,
        messages: prefs.messages ?? false,
        newItemNotes: prefs.newItemNotes ?? false,
        itemStatusUpdates: prefs.itemStatusUpdates ?? false,
    });

    const [loadingKey, setLoadingKey] = useState<string | null>(null);

    // Sync state if user context asynchronous updates land late
    useEffect(() => {
        if (user?.notificationPreferences) {
            setSettings({
                pushEnabled: user.notificationPreferences.pushEnabled ?? false,
                messages: user.notificationPreferences.messages ?? false,
                newItemNotes:
                    user.notificationPreferences.newItemNotes ?? false,
                itemStatusUpdates:
                    user.notificationPreferences.itemStatusUpdates ?? false,
            });
        }
    }, [user]);

    // Handle browser subscription generation when master switch is turned ON
    async function requestBrowserPushSubscription() {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.warn("Push messaging is not supported in this browser.");
            return;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
                ),
            });

            const json = sub.toJSON();
            if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
                await subscribeUser({
                    endpoint: json.endpoint,
                    keys: {
                        p256dh: json.keys.p256dh,
                        auth: json.keys.auth,
                    },
                });
            }
        } catch (err) {
            console.error(
                "Failed to subscribe device to browser push notifications:",
                err,
            );
        }
    }

    const handleToggle = async (key: keyof typeof settings) => {
        const newValue = !settings[key];
        setLoadingKey(key);

        // Optimistic UI updates
        setSettings((prev) => ({ ...prev, [key]: newValue }));

        try {
            // If master push switch is explicitly flipped ON, trigger registration hook
            if (key === "pushEnabled" && newValue === true) {
                await requestBrowserPushSubscription();
            }

            await updateNotificationPreferences({ [key]: newValue });
        } catch (error) {
            console.error("Failed updating notification settings:", error);
            // Revert state on error
            setSettings((prev) => ({ ...prev, [key]: !newValue }));
        } finally {
            setLoadingKey(null);
        }
    };

    const preferenceItems = [
        {
            key: "pushEnabled" as const,
            title: "Enable Push Notifications",
            description:
                "Allow your browser or device to accept push updates from our platform.",
            requiresMaster: false,
        },
        {
            key: "messages" as const,
            title: "Direct Chat Messages",
            description:
                "Receive immediate push alerts when someone sends you a message.",
            requiresMaster: true,
        },
        {
            key: "newItemNotes" as const,
            title: "New Item Notes",
            description: "Get notified when notes are added to your items.",
            requiresMaster: true,
        },
        {
            key: "itemStatusUpdates" as const,
            title: "Item Status Updates",
            description: "Receive updates of status changes to your items.",
            requiresMaster: true,
        },
    ];

    return (
        <section className="space-y-4">
            <h2 className="mb-4 text-lg font-semibold">
                Notification Preferences
            </h2>
            <div className="space-y-4">
                {preferenceItems.map((item) => {
                    const isDisabled =
                        item.requiresMaster && !settings.pushEnabled;
                    const isRowLoading = loadingKey === item.key;

                    return (
                        <div
                            key={item.key}
                            className={`flex items-center justify-between rounded-xl border p-4 transition ${
                                isDisabled
                                    ? "hidden"
                                    : "border-neutral-200 opacity-100"
                            }`}
                        >
                            <div className="w-3/4 pr-4">
                                <span
                                    className={`font-medium ${isDisabled ? "text-neutral-400" : "text-foreground"}`}
                                >
                                    {item.title}
                                </span>
                                <p className="text-sm text-neutral-500 mt-0.5">
                                    {item.description}
                                </p>
                            </div>
                            <div className="flex items-center">
                                {isRowLoading && (
                                    <span className="mr-3 text-xs text-neutral-400 animate-pulse">
                                        Saving...
                                    </span>
                                )}

                                {item.key === "pushEnabled" ? (
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={settings.pushEnabled}
                                        aria-label="Enable Push Notifications"
                                        disabled={isRowLoading}
                                        onClick={() => handleToggle(item.key)}
                                        className={`relative h-7 w-12 rounded-full transition ${
                                            settings.pushEnabled
                                                ? "bg-buzz-blue"
                                                : "bg-neutral-300"
                                        } ${
                                            isRowLoading
                                                ? "cursor-wait opacity-70"
                                                : "cursor-pointer"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                                                settings.pushEnabled
                                                    ? "left-6"
                                                    : "left-1"
                                            }`}
                                        />
                                    </button>
                                ) : (
                                    <input
                                        type="checkbox"
                                        disabled={isDisabled || isRowLoading}
                                        checked={settings[item.key]}
                                        onChange={() => handleToggle(item.key)}
                                        className={`h-5 w-5 accent-buzz-gold cursor-pointer ${
                                            isDisabled
                                                ? "cursor-not-allowed"
                                                : ""
                                        }`}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
