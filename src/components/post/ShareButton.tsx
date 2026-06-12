"use client";

import { useModal } from "@/context/ModalContext";
import { useState } from "react";
import { LuShare2 } from "react-icons/lu";
import { LuX } from "react-icons/lu";

export default function SharePostButton() {
    const { openModal, closeModal } = useModal();
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

    function handleOpenShareModal() {
        openModal({
            content: (
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
                    <div className="w-full flex justify-between items-start mb-2">
                        <h2 className="text-lg font-bold">Share this post</h2>
                        <div
                            onClick={closeModal}
                            className="cursor-pointer p-1 hover:bg-foreground/3 rounded transition"
                        >
                            <LuX />
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
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
                            className="flex-1 border border-foreground/30 rounded px-3 py-2 text-sm bg-foreground/3"
                        />

                        <button
                            onClick={handleCopy}
                            className="bg-buzz-blue text-white px-3 py-2 rounded text-sm hover:opacity-90"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>
            ),
        });
    }

    return (
        <button
            onClick={handleOpenShareModal}
            className="flex items-center gap-2 text-sm text-foreground-90 hover:text-foreground hover:bg-foreground/3 border border-foreground/30 rounded px-3 py-1.5 transition"
        >
            <LuShare2 /> Share Post
        </button>
    );
}
