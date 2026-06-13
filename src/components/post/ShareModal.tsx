"use client";

import { useModal } from "@/context/ModalContext";
import { useState } from "react";
import { LuX } from "react-icons/lu";

export default function ShareModal() {
    const { closeModal } = useModal();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy URL:", err);
        }
    };

    return (
        <div className="bg-white rounded-lg w-full p-5 shadow-xl space-y-2.5 border border-gray-100">
            <div className="flex justify-between items-start">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-buzz-blue">
                    Share this post
                </h2>
                <button
                    onClick={closeModal}
                    className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                >
                    <LuX className="text-lg" />
                </button>
            </div>

            <p className="text-foreground/75 mb-5">
                Copy the link below to share this item.
            </p>

            <div className="flex gap-2 mb-2">
                <input
                    readOnly
                    value={
                        typeof window !== "undefined"
                            ? window.location.href
                            : ""
                    }
                    className="flex-1 border border-foreground/30 rounded-md px-3 py-2 bg-foreground/3"
                />

                <button
                    onClick={handleCopy}
                    className="bg-buzz-blue text-white px-3 py-2 rounded-md hover:opacity-90"
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
        </div>
    );
}
