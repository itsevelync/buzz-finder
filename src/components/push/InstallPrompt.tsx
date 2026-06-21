"use client";

import { useInstall } from "@/context/InstallContext";
import { useModal } from "@/context/ModalContext";
import Image from "next/image";
import {
    LuChevronDown,
    LuEllipsis,
    LuShare,
    LuSquarePlus,
    LuDownload,
    LuTabletSmartphone,
    LuX,
} from "react-icons/lu";

export default function InstallPrompt() {
    const { isIOS, isAndroid, canInstall, install } = useInstall();
    const { closeModal } = useModal();

    const iOSButtonStyle =
        "my-1 font-medium bg-foreground/2 align-middle mx-1.5 inline-flex gap-1 items-center justify-center border border-foreground/30";

    return (
        <div className="relative space-y-4 border border-foreground/20 rounded-xl m-4 p-4 bg-background shadow">
            <button
                onClick={closeModal}
                className="absolute top-2 right-2 p-1 text-lg hover:bg-foreground/10 rounded-lg opacity-60"
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
                    <LuTabletSmartphone className="text-buzz-gold inline-flex align-middle mr-1" />{" "}
                    Install App
                </h3>
                <p className="opacity-70 text-sm">
                    For push notifications and the best user experience, please
                    install BuzzFinder.
                </p>
            </div>
            {/* Android / Chrome */}
            {isAndroid && canInstall && (
                <button
                    onClick={install}
                    className="px-4 py-2 rounded-md border bg-buzz-blue text-background font-medium hover:opacity-80 inline-flex items-center gap-2"
                >
                    <LuDownload />
                    Install App
                </button>
            )}

            {/* Android fallback */}
            {isAndroid && !canInstall && (
                <div className="border border-dashed border-foreground/30 p-4 rounded-lg">
                    <p className="opacity-80">
                        Open your browser menu and choose &ldquo;Install
                        App&rdquo; or &ldquo;Add to Home Screen.&rdquo;
                    </p>
                </div>
            )}

            {/* iOS */}
            {isIOS && (
                <div className="border border-dashed p-3 rounded-lg border-foreground/30 max-w-2xl">
                    <p className="mb-2 font-medium">
                        To install this app on your iOS device:
                    </p>
                    <ol className="text-foreground/85 list-decimal pl-5 marker:font-semibold space-y-2 mb-1 text-sm">
                        <li className="pl-1">
                            Press
                            <span
                                className={`size-6 rounded-full ${iOSButtonStyle}`}
                            >
                                <LuEllipsis className="size-4" />
                            </span>
                            to open the browser menu
                        </li>
                        <li className="pl-1">
                            Tap
                            <span
                                className={`rounded-sm px-1.5 ${iOSButtonStyle}`}
                            >
                                <LuShare /> Share
                            </span>
                            and then
                            <span
                                className={`rounded-sm px-1.5 ${iOSButtonStyle}`}
                            >
                                <LuChevronDown /> View more
                            </span>
                        </li>
                        <li className="pl-1">
                            Select
                            <span
                                className={`rounded-sm px-1.5 ${iOSButtonStyle}`}
                            >
                                <LuSquarePlus className="min-w-4" /> Add to Home
                                Screen
                            </span>
                        </li>
                    </ol>
                </div>
            )}
            <p className="text-sm opacity-50">
                A BuzzFinder app icon will be added to your Home Screen.
            </p>
        </div>
    );
}
