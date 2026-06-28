"use client";

import { useState, useEffect } from "react";
import { updateNotificationPreferences } from "@/actions/Notification";
import { subscribeUser, unsubscribeUser } from "@/actions/Notification";
import { urlBase64ToUint8Array } from "@/lib/push";
import { UserContextUser } from "@/context/UserContext";
import { NotificationPreferences } from "@/model/User";
import { LuTriangleAlert, LuBellRing, LuRefreshCw } from "react-icons/lu";

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
    const [permissionState, setPermissionState] =
        useState<NotificationPermission>("default");

    // NEW: Tracks if this specific local device lacks a registration record
    const [isDeviceSubscribed, setIsDeviceSubscribed] = useState<boolean>(true);
    const [checkingDevice, setCheckingDevice] = useState<boolean>(true);

    // 1. Check native system permission state
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermissionState(Notification.permission);
        }
    }, [settings.pushEnabled]);

    // 2. NEW: Check if the current device actually has a live push token
    useEffect(() => {
        async function checkDeviceSubscription() {
            if (
                typeof window === "undefined" ||
                !("serviceWorker" in navigator) ||
                !("PushManager" in window)
            ) {
                setCheckingDevice(false);
                return;
            }
            try {
                const registration = await navigator.serviceWorker.ready;
                const sub = await registration.pushManager.getSubscription();

                // If sub is null, this specific device is NOT subscribed to the push service
                setIsDeviceSubscribed(!!sub);
            } catch (err) {
                console.error("Error checking device subscription:", err);
            } finally {
                setCheckingDevice(false);
            }
        }

        checkDeviceSubscription();
    }, [settings.pushEnabled]);

    // 3. Sync state if user context asynchronous updates land late
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

    // Handle browser subscription generation
    async function requestBrowserPushSubscription() {
        if (
            !("serviceWorker" in navigator) ||
            !("PushManager" in window) ||
            !("Notification" in window)
        ) {
            console.warn("Push messaging is not supported in this browser.");
            return;
        }
        try {
            const permission = await Notification.requestPermission();
            setPermissionState(permission);

            if (permission !== "granted") {
                throw new Error("System level notification permission denied.");
            }

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

                // Mark device as successfully linked up locally
                setIsDeviceSubscribed(true);
            }
        } catch (err) {
            console.error(
                "Failed to subscribe device to browser push notifications:",
                err,
            );
            throw err;
        }
    }

    async function unregisterBrowserPushSubscription() {
        if (!("serviceWorker" in navigator) || !("PushManager" in window))
            return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();

            if (sub) {
                const endpoint = sub.endpoint;

                // 1. Unsubscribe locally from the device browser engine
                await sub.unsubscribe();

                // 2. Call your custom Server Action to drop it from the DB
                await unsubscribeUser(endpoint);
            }

            setIsDeviceSubscribed(false);
        } catch (err) {
            console.error("Failed to cleanly unsubscribe device:", err);
        }
    }

    const handleToggle = async (key: keyof typeof settings) => {
        const newValue = !settings[key];
        setLoadingKey(key);

        setSettings((prev) => ({ ...prev, [key]: newValue }));

        try {
            if (key === "pushEnabled") {
                if (newValue === true) {
                    await requestBrowserPushSubscription();
                } else {
                    // User turned the master switch OFF -> Wipe the token!
                    await unregisterBrowserPushSubscription();
                }
            }

            await updateNotificationPreferences({ [key]: newValue });
        } catch (error) {
            console.error("Failed updating notification settings:", error);
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

    // Mismatch state: Account says true, but browser layer says false
    const showDeviceMismatchWarning =
        settings.pushEnabled && !checkingDevice && !isDeviceSubscribed;
    const showPermissionWarning =
        settings.pushEnabled && permissionState !== "granted";

    return (
        <section className="space-y-4">
            <h2 className="mb-4 text-lg font-semibold">
                Notification Preferences
            </h2>
            <div className="space-y-4">
                {preferenceItems.map((item) => {
                    const isDisabled =
                        item.requiresMaster &&
                        (!settings.pushEnabled ||
                            permissionState !== "granted" ||
                            !isDeviceSubscribed);
                    const isRowLoading = loadingKey === item.key;

                    return (
                        <div key={item.key} className="space-y-3">
                            <div
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
                                            onClick={() =>
                                                handleToggle(item.key)
                                            }
                                            className={`relative h-7 w-12 rounded-full transition ${
                                                settings.pushEnabled
                                                    ? "bg-buzz-blue"
                                                    : "bg-neutral-300"
                                            } ${isRowLoading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
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
                                            disabled={
                                                isDisabled || isRowLoading
                                            }
                                            checked={settings[item.key]}
                                            onChange={() =>
                                                handleToggle(item.key)
                                            }
                                            className={`h-5 w-5 accent-buzz-gold cursor-pointer ${
                                                isDisabled
                                                    ? "cursor-not-allowed"
                                                    : ""
                                            }`}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* WARNING 1: BROWSER BLOCKS OR WANTS PERMISSION */}
                            {item.key === "pushEnabled" &&
                                showPermissionWarning && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 text-sm rounded-lg border border-destructive/20 bg-destructive/5 text-destructive-foreground">
                                        <div className="flex items-start gap-2">
                                            <LuTriangleAlert className="text-destructive mt-0.5 shrink-0 text-base" />
                                            <div>
                                                <p className="font-semibold text-neutral-900">
                                                    Device permission missing
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {permissionState ===
                                                    "denied"
                                                        ? "Your browser is blocking alerts. Please re-enable notifications manually inside your browser's site settings layout."
                                                        : "You haven't authorized system popups on this device yet."}
                                                </p>
                                            </div>
                                        </div>
                                        {permissionState === "default" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    requestBrowserPushSubscription()
                                                }
                                                className="ml-auto px-3 py-1.5 whitespace-nowrap rounded-md text-xs font-semibold bg-buzz-blue text-background hover:opacity-90 transition flex items-center gap-1 shadow-sm"
                                            >
                                                <LuBellRing className="text-sm" />
                                                Grant Permission
                                            </button>
                                        )}
                                    </div>
                                )}

                            {/* WARNING 2: TARGET MISMATCH (Enabled in settings, but unsubscribed on this device) */}
                            {item.key === "pushEnabled" &&
                                showDeviceMismatchWarning &&
                                !showPermissionWarning && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 text-sm rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-800">
                                        <div className="flex items-start gap-2">
                                            <LuTriangleAlert className="text-amber-500 mt-0.5 shrink-0 text-base" />
                                            <div>
                                                <p className="font-semibold text-neutral-900">
                                                    Device unlinked
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    Notifications are active on
                                                    your profile, but this
                                                    specific device isn&rsquo;t
                                                    registered to receive them.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                requestBrowserPushSubscription()
                                            }
                                            className="ml-auto px-3 py-1.5 whitespace-nowrap rounded-md text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition flex items-center gap-1 shadow-sm"
                                        >
                                            <LuRefreshCw className="text-xs" />
                                            Sync This Device
                                        </button>
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
