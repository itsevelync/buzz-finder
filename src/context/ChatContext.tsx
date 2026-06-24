"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusherClient";
import {
    ChatMessageSummary,
    ChatUserSummary,
    ConversationSummary,
} from "@/lib/chat";

const MESSAGE_PAGE_SIZE = 10;

interface ChatContextType {
    currentUser: ChatUserSummary;
    users: ChatUserSummary[];
    conversationItems: ConversationSummary[];
    activeConversationId: string | null;
    pendingConversation: ConversationSummary | null;
    messageCache: Record<string, ChatMessageSummary[]>;
    isSearching: boolean;
    setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
    setPendingConversation: React.Dispatch<
        React.SetStateAction<ConversationSummary | null>
    >;
    setMessageCache: React.Dispatch<
        React.SetStateAction<Record<string, ChatMessageSummary[]>>
    >;
    setConversationList: React.Dispatch<
        React.SetStateAction<ConversationSummary[]>
    >;
    refreshConversations: () => Promise<void>;
    setActiveConversationId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
    children,
    currentUser,
    users,
    initialConversations,
}: {
    children: React.ReactNode;
    currentUser: ChatUserSummary;
    users: ChatUserSummary[];
    initialConversations: ConversationSummary[];
}) {
    const params = useParams();
    const router = useRouter();

    // Derived straight from the URL path segment [id]
    const activeConversationId = (params?.id as string) || null;

    // 1. Extract the initial ID from the URL path segment [id]
    const urlActiveId = (params?.id as string) || null;

    // 2. Introduce a local state that updates IMMEDIATELY without waiting for Next.js routing
    const [localActiveId, setLocalActiveId] = useState<string | null>(
        urlActiveId,
    );

    const [conversationList, setConversationList] =
        useState(initialConversations);
    const [messageCache, setMessageCache] = useState<
        Record<string, ChatMessageSummary[]>
    >(() => {
        const initialCache: Record<string, ChatMessageSummary[]> = {};
        for (const conv of initialConversations) {
            if (conv.lastMessage) {
                // Seed the cache with the preview message so the UI can immediately access it
                initialCache[conv._id] = [conv.lastMessage];
            }
        }
        return initialCache;
    });
    const [isSearching, setIsSearching] = useState(false);
    const [pendingConversation, setPendingConversation] =
        useState<ConversationSummary | null>(null);

    const activeConversationIdRef = useRef<string | null>(activeConversationId);
    const messageCacheRef = useRef(messageCache);

    // 3. Keep the local state synchronized if the user navigates using Browser Back/Forward buttons
    useEffect(() => {
        setLocalActiveId(urlActiveId);
    }, [urlActiveId]);

    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);
    useEffect(() => {
        messageCacheRef.current = messageCache;
    }, [messageCache]);

    // Reconstruct pending conversations if route is reloaded directly
    useEffect(() => {
        if (
            activeConversationId?.startsWith("pending-") &&
            !pendingConversation
        ) {
            const participantId = activeConversationId.replace(/^pending-/, "");
            const partner = users.find((u) => u._id === participantId) ?? null;
            if (partner) {
                setPendingConversation({
                    _id: activeConversationId,
                    participants: [
                        {
                            userId: currentUser._id.toString(),
                            lastReadAt: new Date().toISOString(),
                        },
                        {
                            userId: participantId.toString(),
                            lastReadAt: new Date().toISOString(),
                        },
                    ],
                    lastMessageAt: "",
                    partner,
                    lastMessage: null,
                });
            } else {
                router.replace("/messages");
            }
        }
    }, [activeConversationId, pendingConversation, users, currentUser, router]);
    const conversationItems = useMemo(() => {
        // If we've clicked away from the pending chat, immediately drop it from the UI list
        if (localActiveId && !localActiveId.startsWith("pending-")) {
            return conversationList;
        }
        return pendingConversation
            ? [pendingConversation, ...conversationList]
            : conversationList;
    }, [conversationList, pendingConversation, localActiveId]);

    const setActiveConversationId = useCallback(
        (id: string | null) => {
            // Instantly update local state to clear out the sidebar lag
            setLocalActiveId(id);

            if (!id || !id.startsWith("pending-")) {
                setPendingConversation(null);
            }

            if (id) {
                router.push(`/messages/${id}`);
            } else {
                router.push("/messages");
            }
        },
        [router],
    );

    const refreshConversations = useCallback(async () => {
        const response = await fetch("/api/conversations");
        if (!response.ok) return;
        const data = await response.json();
        setConversationList(data);
    }, []);

    const fetchMessagePreview = useCallback(async (conversationId: string) => {
        if (conversationId.startsWith("pending-")) return;
        if (
            conversationId === activeConversationIdRef.current &&
            (messageCacheRef.current[conversationId]?.length ?? 0) >
                MESSAGE_PAGE_SIZE
        )
            return;

        const response = await fetch(
            `/api/messages/${conversationId}?limit=${MESSAGE_PAGE_SIZE}`,
        );
        if (!response.ok) return;
        const messages = await response.json();
        setMessageCache((current) => ({
            ...current,
            [conversationId]: messages,
        }));
    }, []);

    useEffect(() => {
        const ids = conversationList
            .map((c) => c._id)
            .filter((id) => !id.startsWith("pending-"));
        void Promise.all(ids.map((id) => fetchMessagePreview(id)));
    }, [conversationList, fetchMessagePreview]);

    useEffect(() => {
        const handleInboxUpdate = (payload?: { conversationId?: string }) => {
            void refreshConversations();
            if (
                payload?.conversationId &&
                payload.conversationId !== activeConversationIdRef.current
            ) {
                void fetchMessagePreview(payload.conversationId);
            }
        };

        const inboxChannel = pusherClient.subscribe(`inbox-${currentUser._id}`);
        inboxChannel.bind("conversation-updated", handleInboxUpdate);
        return () => {
            inboxChannel.unbind("conversation-updated", handleInboxUpdate);
            pusherClient.unsubscribe(`inbox-${currentUser._id}`);
        };
    }, [currentUser._id, fetchMessagePreview, refreshConversations]);

    return (
        <ChatContext.Provider
            value={{
                currentUser,
                users,
                conversationItems,
                activeConversationId: localActiveId, // Use the instant local identifier here
                pendingConversation,
                messageCache,
                isSearching,
                setIsSearching,
                setPendingConversation,
                setMessageCache,
                setConversationList,
                refreshConversations,
                setActiveConversationId,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within a ChatProvider");
    return context;
}
