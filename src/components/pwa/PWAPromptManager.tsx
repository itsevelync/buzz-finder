"use client";

import { useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { useInstall } from "@/context/InstallContext";
import { useUser } from "@/context/UserContext";

import InstallPrompt from "@/components/pwa/InstallPrompt";
import NotificationPrompt from "@/components/pwa/NotificationPrompt";

const INSTALL_DISMISS_KEY = "install-prompt-dismissed";
const NOTIFICATION_DISMISS_KEY = "notification-prompt-dismissed";

export default function PWAPromptManager() {
    const { openModal, basicCloseModal } = useModal();
    const { isIOS, isAndroid, isStandalone } = useInstall();
    const { user } = useUser();

    useEffect(() => {
        // --- GLOBAL SERVICE WORKER REGISTRATION ---
        // Registers the worker on every page visit so background push tasks work globally
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker
                .register("/sw.js", {
                    scope: "/",
                    updateViaCache: "none",
                })
                .catch((err) => {
                    console.error(
                        "Service worker registration failed from manager:",
                        err,
                    );
                });
        }

        // --- CASE 1: User is already inside the installed standalone PWA ---
        if (isStandalone) {
            if (!user?._id) return;

            const checkSubscriptionAndPrompt = async () => {
                // Safeguard browser context checks
                if (
                    !("serviceWorker" in navigator) ||
                    !("PushManager" in window)
                )
                    return;

                try {
                    const registration = await navigator.serviceWorker.ready;
                    const sub =
                        await registration.pushManager.getSubscription();

                    // If they are already subscribed, skip showing the modal!
                    if (sub) return;

                    // Check if they already dismissed this modal
                    const dismissed = localStorage.getItem(
                        NOTIFICATION_DISMISS_KEY,
                    );
                    if (dismissed) {
                        const days =
                            (Date.now() - Number(dismissed)) /
                            (1000 * 60 * 60 * 24);
                        if (days < 30) return;
                    }

                    function dismiss() {
                        localStorage.setItem(
                            NOTIFICATION_DISMISS_KEY,
                            Date.now().toString(),
                        );
                        basicCloseModal();
                    }

                    openModal(<NotificationPrompt />, {
                        maxWidth: "md",
                        closeFunction: dismiss,
                    });
                } catch (error) {
                    console.error(
                        "Failed checking push registration state:",
                        error,
                    );
                }
            };

            const timeout = setTimeout(() => {
                checkSubscriptionAndPrompt();
            }, 1500);

            return () => clearTimeout(timeout);
        }

        // --- CASE 2: User is visiting via the mobile web browser ---
        if (!isIOS && !isAndroid) return;

        const dismissed = localStorage.getItem(INSTALL_DISMISS_KEY);
        if (dismissed) {
            const days =
                (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);
            if (days < 30) return;
        }

        function dismiss() {
            localStorage.setItem(INSTALL_DISMISS_KEY, Date.now().toString());
            basicCloseModal();
        }

        const timeout = setTimeout(() => {
            openModal(<InstallPrompt />, {
                maxWidth: "md",
                closeFunction: dismiss,
            });
        }, 1500);

        return () => clearTimeout(timeout);
    }, [isIOS, isAndroid, isStandalone, openModal, basicCloseModal]);

    return null;
}
