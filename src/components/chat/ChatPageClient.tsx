"use client";

import {
    useEffect,
    useMemo,
    useState,
    useRef,
    TouchEvent,
    useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pusherClient } from "@/lib/pusherClient";
import {
    ChatMessageSummary,
    ChatUserSummary,
    ConversationSummary,
} from "@/lib/chat";
import ChatWindow from "./ChatWindow";
import ChatConversationsList from "./ChatConversationsList";
import ChatNewConversationSearch from "./ChatNewConversationSearch";
import { LuSquarePen, LuX } from "react-icons/lu";

const MESSAGE_PAGE_SIZE = 10;

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
    const [messageCache, setMessageCache] = useState<
        Record<string, ChatMessageSummary[]>
    >({});
    const [isSearching, setIsSearching] = useState(false);
    const activeConversationIdRef = useRef<string | null>(activeConversationId);
    const messageCacheRef = useRef(messageCache);

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

    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        messageCacheRef.current = messageCache;
    }, [messageCache]);

    const fetchMessagePreview = useCallback(async (conversationId: string) => {
        if (conversationId.startsWith("pending-")) {
            return;
        }

        if (
            conversationId === activeConversationIdRef.current &&
            (messageCacheRef.current[conversationId]?.length ?? 0) >
                MESSAGE_PAGE_SIZE
        ) {
            return;
        }

        const response = await fetch(
            `/api/messages/${conversationId}?limit=${MESSAGE_PAGE_SIZE}`,
        );

        if (!response.ok) {
            return;
        }

        const messages = (await response.json()) as ChatMessageSummary[];

        setMessageCache((current) => ({
            ...current,
            [conversationId]: messages,
        }));
    }, []);

    const refreshConversations = useCallback(async () => {
        const response = await fetch("/api/conversations");
        if (!response.ok) return;
        const data = (await response.json()) as ConversationSummary[];
        setConversationList(data);
    }, []);

    useEffect(() => {
        const conversationIds = conversationList
            .map((conversation) => conversation._id)
            .filter((conversationId) => !conversationId.startsWith("pending-"));

        void Promise.all(
            conversationIds.map((conversationId) =>
                fetchMessagePreview(conversationId),
            ),
        );
    }, [conversationList, fetchMessagePreview]);

    useEffect(() => {
        const inboxChannel = pusherClient.subscribe(`inbox-${currentUser._id}`);
        const handleInboxUpdate = (payload?: { conversationId?: string }) => {
            void refreshConversations();

            if (
                payload?.conversationId &&
                payload.conversationId !== activeConversationId
            ) {
                void fetchMessagePreview(payload.conversationId);
            }
        };

        inboxChannel.bind("conversation-updated", handleInboxUpdate);

        return () => {
            inboxChannel.unbind("conversation-updated", handleInboxUpdate);
            pusherClient.unsubscribe(`inbox-${currentUser._id}`);
        };
    }, [
        activeConversationId,
        currentUser._id,
        fetchMessagePreview,
        refreshConversations,
    ]);

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
                                setIsSearching={setIsSearching}
                            />
                        </div>
                    )}
                </div>

                <ChatConversationsList
                    key={conversationItems.length}
                    conversationItems={conversationItems}
                    activeConversationId={activeConversationId}
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
                    messageCache={messageCache}
                    setMessageCache={setMessageCache}
                />
            </div>
        </div>
    );
}
