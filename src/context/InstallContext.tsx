"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: "accepted" | "dismissed";
    }>;
}

interface InstallContextType {
    isIOS: boolean;
    isAndroid: boolean;
    isStandalone: boolean;
    canInstall: boolean;
    install: () => Promise<boolean>;
}

const InstallContext = createContext<InstallContextType | undefined>(undefined);

export function InstallProvider({ children }: { children: ReactNode }) {
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const ua = navigator.userAgent;

        const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);

        const android = /Android/i.test(ua);

        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            !!("standalone" in window.navigator && window.navigator.standalone);

        setIsIOS(ios);
        setIsAndroid(android);
        setIsStandalone(standalone);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();

            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
        };
    }, []);

    async function install() {
        if (!deferredPrompt) {
            return false;
        }

        await deferredPrompt.prompt();

        const result = await deferredPrompt.userChoice;

        if (result.outcome === "accepted") {
            setDeferredPrompt(null);
            return true;
        }

        return false;
    }

    return (
        <InstallContext.Provider
            value={{
                isIOS,
                isAndroid,
                isStandalone,
                canInstall: !!deferredPrompt || isIOS,
                install,
            }}
        >
            {children}
        </InstallContext.Provider>
    );
}

export function useInstall() {
    const context = useContext(InstallContext);

    if (!context) {
        throw new Error("useInstall must be used within InstallProvider");
    }

    return context;
}
