"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuContact, LuMessagesSquare } from "react-icons/lu";
import { ContactInfoList } from "../profile/ContactInfoList";
import { User } from "@/model/User";

interface ItemPosterContactInfoProps {
    userId?: string;
    itemPoster?: User | null;
    itemContactInfo?: { name?: string | null; details?: string | null } | null;
    title?: string;
}

export default function ItemPosterContactInfo({
    userId,
    itemPoster,
    itemContactInfo,
    title = "Item Owner Contact Information",
}: ItemPosterContactInfoProps) {
    const router = useRouter();

    const isOwner = userId && itemPoster && userId === itemPoster._id;

    const [loadingChat, setLoadingChat] = useState(false);

    async function handleLoadChat() {
        if (!itemPoster) return;

        try {
            setLoadingChat(true);
            const response = await fetch(
                `/api/conversations?partnerId=${itemPoster._id}`,
            );
            const data = await response.json();

            let chatId = data.conversationId;
            if (!chatId) {
                chatId = "pending-" + itemPoster._id;
            }
            router.push("/messages/" + chatId);
        } catch {
            console.error("Error fetching chat.");
            setLoadingChat(false);
        }
    }

    const noContactDetails =
        !itemContactInfo || (!itemContactInfo.name && !itemContactInfo.details);

    if (!itemPoster && noContactDetails) return;

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <LuContact className="text-buzz-gold" /> {title}
            </h3>

            {itemContactInfo && (
                <div className="flex flex-col gap-1 text-sm mb-1">
                    <div>
                        <span className="font-medium">
                            {itemContactInfo.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                        <span>
                            {itemContactInfo.details ||
                                "No contact details provided."}
                        </span>
                    </div>
                </div>
            )}

            {itemPoster && <ContactInfoList user={itemPoster} />}

            {itemPoster && !isOwner && (
                <button
                    disabled={loadingChat || !userId}
                    onClick={handleLoadChat}
                    className="mt-4 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium
                        py-2.5 rounded transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <LuMessagesSquare />{" "}
                    {!userId
                        ? "Log in to message item owner"
                        : loadingChat
                          ? "Redirecting..."
                          : "Message Item Owner"}
                </button>
            )}
        </div>
    );
}
