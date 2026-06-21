"use client";

import { useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { useInstall } from "@/context/InstallContext";

import InstallPrompt from "@/components/push/InstallPrompt";

const DISMISS_KEY = "install-prompt-dismissed";

export default function InstallPromptManager() {
    const { openModal, basicCloseModal } = useModal();

    const { isIOS, isAndroid, isStandalone } = useInstall();

    useEffect(() => {
        if (isStandalone) return;

        if (!isIOS && !isAndroid) return;

        const dismissed = localStorage.getItem(DISMISS_KEY);

        if (dismissed) {
            const days =
                (Date.now() - Number(dismissed)) / (1000 * 60 * 60 * 24);

            if (days < 30) return;
        }

        if (dismissed) return;

        function dismiss() {
            localStorage.setItem(DISMISS_KEY, Date.now().toString());
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
