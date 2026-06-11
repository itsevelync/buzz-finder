"use client";

import { useEffect, useMemo, useState, useRef, TouchEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pusherClient } from "@/lib/pusherClient";
import { ChatUserSummary, ConversationSummary } from "@/lib/chat";
import ChatWindow from "./ChatWindow";
import ChatConversationsList from "./ChatConversationsList";
import ChatNewConversationSearch from "./ChatNewConversationSearch";
import { LuSquarePen, LuX } from "react-icons/lu";

type ChatPageClientProps = {
    currentUser: ChatUserSummary;
    users: ChatUserSummary[];
    conversations: ConversationSummary[];
    initialConversationId: string | null;
};

export default function ChatPageClient({
    currentUser,
    users,
    conversations,
    initialConversationId,
}: ChatPageClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(initialConversationId);
    const [conversationList, setConversationList] = useState(conversations);
    const [isSearching, setIsSearching] = useState(false);

    const [pendingConversation, setPendingConversation] =
        useState<ConversationSummary | null>(() => {
            if (!initialConversationId?.startsWith("pending-")) {
                return null;
            }

            const participantId = initialConversationId.replace(
                /^pending-/,
                "",
            );
            const partner = users.find((u) => u._id === participantId) ?? null;

            if (partner) {
                return {
                    _id: initialConversationId,
                    participants: [
                        {
                            userId: currentUser._id.toString(),
                            lastReadAt: new Date(),
                        },
                        {
                            userId: participantId.toString(),
                            lastReadAt: new Date(),
                        },
                    ],
                    lastMessageAt: "",
                    partner,
                    lastMessage: null,
                };
            } else {
                setActiveConversationId(null);
                return null;
            }
        });

    const conversationItems = useMemo(
        () =>
            pendingConversation
                ? [pendingConversation, ...conversationList]
                : conversationList,
        [conversationList, pendingConversation],
    );

    const refreshConversations = async () => {
        const response = await fetch("/api/conversations");
        if (!response.ok) return;
        const data = (await response.json()) as ConversationSummary[];
        setConversationList(data);
    };

    useEffect(() => {
        const inboxChannel = pusherClient.subscribe(`inbox-${currentUser._id}`);
        const handleInboxUpdate = () => {
            void refreshConversations();
        };

        inboxChannel.bind("conversation-updated", handleInboxUpdate);

        return () => {
            inboxChannel.unbind("conversation-updated", handleInboxUpdate);
            pusherClient.unsubscribe(`inbox-${currentUser._id}`);
        };
    }, [currentUser._id]);

    useEffect(() => {
        const currentIdInUrl = searchParams.get("id");

        // If state reflects URL exactly, halt operation to break execution recursion loops
        if (activeConversationId === currentIdInUrl) return;
        if (activeConversationId?.startsWith("pending-") && !currentIdInUrl)
            return;

        const params = new URLSearchParams(searchParams.toString());
        if (
            activeConversationId &&
            !activeConversationId.startsWith("pending-")
        ) {
            params.set("id", activeConversationId);
        } else {
            params.delete("id");
        }

        router.replace(`${pathname}?${params.toString()}`, {
            scroll: false,
        });
    }, [activeConversationId, pathname, router, searchParams]);

    // Touch gesture tracking
    const touchStartX = useRef<number>(0);
    const touchCurrentX = useRef<number>(0);
    const minSwipeDistance = 50; // Minimum distance in pixels to trigger swipe

    // Handle Touch Start
    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchCurrentX.current = e.targetTouches[0].clientX;
    };

    // Handle Touch Move
    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        touchCurrentX.current = e.targetTouches[0].clientX;
    };

    // Handle Touch End (Swipe left-to-right to close right pane)
    const handleTouchEnd = () => {
        const distance = touchCurrentX.current - touchStartX.current;

        // If the right panel is open, and user drags from left to right
        if (activeConversationId && distance > minSwipeDistance) {
            setActiveConversationId(null);
        }
    };

    return (
        <div className="flex h-full w-full overflow-hidden relative">
            {/* LEFT COLUMN: Conversation List */}
            <aside className="flex h-full w-full md:w-1/3 lg:w-95 flex-col bg-background md:border-r md:border-buzz-blue/10">
                <div className="border-b border-buzz-blue/10 p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-buzz-blue">
                            Messages
                        </h1>

                        {/* Toggle Button */}
                        <button
                            onClick={() => setIsSearching(!isSearching)}
                            className="p-2 rounded-full hover:bg-buzz-blue/5 text-buzz-blue transition-colors"
                            aria-label={
                                isSearching ? "Close search" : "New message"
                            }
                        >
                            {isSearching ? (
                                <LuX className="h-6 w-6" />
                            ) : (
                                <LuSquarePen className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Conditionally rendered Search Component */}
                    {isSearching && (
                        <div className="animate-in fade-in duration-200 mt-4">
                            <ChatNewConversationSearch
                                users={users}
                                conversationItems={conversationItems}
                                pendingConversation={pendingConversation}
                                currentUser={currentUser}
                                setPendingConversation={setPendingConversation}
                                setActiveConversationId={
                                    setActiveConversationId
                                }
                            />
                        </div>
                    )}
                </div>

                <ChatConversationsList
                    key={conversationItems.length}
                    conversationItems={conversationItems}
                    activeConversationId={activeConversationId}
                    setPendingConversation={setPendingConversation}
                    setActiveConversationId={setActiveConversationId}
                />
            </aside>

            {/* RIGHT COLUMN: Chat View */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                    absolute right-0 z-50 flex h-full flex-col bg-slate-50 transition-transform duration-300 ease-in-out
                    w-full md:static flex-1 md:translate-x-0 md:z-0
                    ${activeConversationId ? "translate-x-0" : "translate-x-full"}
                    `}
            >
                <ChatWindow
                    conversationItems={conversationItems}
                    currentUser={currentUser}
                    activeConversationId={activeConversationId}
                    setActiveConversationId={setActiveConversationId}
                    refreshConversations={refreshConversations}
                    setConversationList={setConversationList}
                    pendingConversation={pendingConversation}
                    setPendingConversation={setPendingConversation}
                />
            </div>
        </div>
    );
}
