"use client";

import { LostItemPost } from "@/model/LostItemPost";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuMail, LuMessagesSquare, LuPhone, LuUser } from "react-icons/lu";

interface PostOwnerContactInfoProps {
    lost_item: LostItemPost;
    session: Session | null;
}

export default function PostOwnerContactInfo({
    lost_item,
    session,
}: PostOwnerContactInfoProps) {
    const router = useRouter();

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
            <div className="border border-gray-200 rounded-lg p-4 shadow-md bg-white">
                <h3 className="font-semibold mb-3">
                    Item Owner Contact Information
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

    return (
        <div className="border border-gray-200 rounded-lg p-4 shadow-md bg-white">
            <h3 className="font-semibold mb-3">
                Item Owner Contact Information
            </h3>

            <div className="flex flex-col gap-2 text-sm mb-4">
                <div>
                    <span className="font-medium">{lost_item.user?.name}</span>
                </div>

                {lost_item.user?.username && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <LuUser />
                        <span>{lost_item.user?.username}</span>
                    </div>
                )}

                {lost_item.user?.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <LuMail />
                        <span>{lost_item.user?.email}</span>
                    </div>
                )}

                {lost_item.user?.phoneNum && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <LuPhone />
                        <span>{lost_item.user?.phoneNum}</span>
                    </div>
                )}
            </div>
            <button
                disabled={loadingChat || !session?.user?._id}
                onClick={handleLoadChat}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <LuMessagesSquare />{" "}
                {!session?.user?._id
                    ? "Log in to message item owner"
                    : loadingChat
                      ? "Redirecting..."
                      : "Message Item Owner"}
            </button>
        </div>
    );
}
