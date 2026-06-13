"use client";

import { LostItemPost } from "@/model/LostItemPost";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuContact, LuMessagesSquare } from "react-icons/lu";
import { ContactInfoList } from "../profile/ContactInfoList";

interface PostOwnerContactInfoProps {
    lost_item: LostItemPost;
    session: Session | null;
}

export default function PostOwnerContactInfo({
    lost_item,
    session,
}: PostOwnerContactInfoProps) {
    const router = useRouter();

    const isOwner =
        session?.user?._id && session?.user?._id === lost_item.user?._id;

    const [loadingChat, setLoadingChat] = useState(false);

    async function handleLoadChat() {
        if (!lost_item.user) return;

        try {
            setLoadingChat(true);
            const response = await fetch(
                `/api/conversations?partnerId=${lost_item.user._id}`,
            );
            const data = await response.json();

            let chatId = data.conversationId;
            if (chatId) {
                console.log("Found existing chat:", chatId);
            } else {
                chatId = "pending-" + lost_item.user._id;
                console.log("No chat exists yet between these two users.");
            }
            router.push("/chat?id=" + chatId);
        } catch {
            console.error("Error fetching chat.");
            setLoadingChat(false);
        }
    }

    if (!lost_item.user && !lost_item.contactInfo) return;

    if (lost_item.contactInfo) {
        const itemOwner = lost_item.contactInfo;

        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LuContact className="text-buzz-gold" /> Item Owner Contact
                    Information
                </h3>

                <div className="flex flex-col gap-1 text-sm mb-1">
                    <div>
                        <span className="font-medium">{itemOwner.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                        <span>{itemOwner.details}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (lost_item.user) {
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <LuContact className="text-buzz-gold" /> Item Owner Contact
                    Information
                </h3>

                <ContactInfoList user={lost_item.user} />

                {!isOwner && (
                    <button
                        disabled={loadingChat || !session?.user?._id}
                        onClick={handleLoadChat}
                        className="mt-4 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <LuMessagesSquare />{" "}
                        {!session?.user?._id
                            ? "Log in to message item owner"
                            : loadingChat
                              ? "Redirecting..."
                              : "Message Item Owner"}
                    </button>
                )}
            </div>
        );
    }
}
