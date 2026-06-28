"use client";

import { useModal } from "@/context/ModalContext";
import { urlBase64ToUint8Array } from "@/lib/push";
import { subscribeUser } from "@/actions/Notification";
import { updateNotificationPreferences } from "@/actions/Notification";
import Image from "next/image";
import { useState } from "react";
import { LuBell, LuX } from "react-icons/lu";
import { useUser } from "@/context/UserContext";

export default function NotificationPrompt() {
    const { closeModal } = useModal();
    const { user, refreshUser } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubscribe() {
        setIsSubmitting(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                throw new Error(
                    "Permission denied. You can enable them manually in your browser settings.",
                );
            }

            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
                ),
            });

            const json = sub.toJSON();
            if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
                throw new Error("Invalid push subscription structure.");
            }

            // 1. Link the physical browser token to your push tracking architecture
            await subscribeUser({
                endpoint: json.endpoint,
                keys: {
                    p256dh: json.keys.p256dh,
                    auth: json.keys.auth,
                },
            });

            // Check if push was previously false or missing entirely
            const wasPushDisabled = !user?.notificationPreferences?.pushEnabled;

            // 2. Only turn everything on if they hadn't enabled push previously
            if (wasPushDisabled) {
                await updateNotificationPreferences({
                    pushEnabled: true,
                    messages: true,
                    newItemNotes: true,
                    itemStatusUpdates: true,
                });
            }

            await refreshUser();
            closeModal();
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="relative space-y-4 border border-foreground/20 rounded-xl m-4 p-4 bg-background shadow">
            <button
                onClick={closeModal}
                className="absolute top-2 right-2 p-1 text-lg hover:bg-foreground/10 rounded-lg opacity-60"
                disabled={isSubmitting}
            >
                <LuX />
            </button>

            <Image
                src="/icon-512x512.png"
                alt="BuzzFinder Icon"
                width={70}
                height={70}
                className="border rounded-lg border-foreground/10 shadow"
            />

            <div className="space-y-1">
                <h3 className="font-semibold text-lg">
                    <LuBell className="text-buzz-gold inline-flex align-middle mr-1 animate-bounce" />{" "}
                    Enable Push Notifications
                </h3>
                <p className="opacity-70 text-sm">
                    Stay updated with instant alerts and updates straight to
                    your device from BuzzFinder.
                </p>
            </div>

            {error && (
                <p className="text-destructive text-xs font-medium border border-destructive/20 bg-destructive/5 p-2 rounded">
                    {error}
                </p>
            )}

            <div className="flex w-full gap-2 pt-2">
                <button
                    onClick={handleSubscribe}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-md border bg-buzz-blue text-background font-medium hover:opacity-80 inline-flex items-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? "Enabling..." : "Allow Notifications"}
                </button>
                <button
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="grow px-4 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 font-medium text-sm"
                >
                    Later
                </button>
            </div>
        </div>
    );
}
