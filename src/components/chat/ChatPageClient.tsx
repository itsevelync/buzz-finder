"use client";

import { pusherClient } from "@/lib/pusherClient";
import {
    ChatMessageSummary,
    ChatUserSummary,
    ConversationSummary,
} from "@/lib/chat";
import { useEffect, useMemo, useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatConversationsList from "./ChatConversationsList";
import ChatNewConversationSearch from "./ChatNewConversationSearch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ChatPageClientProps = {
    currentUser: ChatUserSummary;
    users: ChatUserSummary[];
    conversations: ConversationSummary[];
    initialConversationId: string | null;
    initialMessages: ChatMessageSummary[];
};

export default function ChatPageClient({
    currentUser,
    users,
    conversations,
    initialConversationId,
    initialMessages,
}: ChatPageClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(initialConversationId);
    const [conversationList, setConversationList] = useState(conversations);

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
                    participantIds: [currentUser._id, participantId],
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

    // FIX: Optimized url synchronized side-effect tracking loop
    useEffect(() => {
        const currentIdInUrl = searchParams.get("id");

        // If state reflects URL exactly, halt operation to break execution recursion loops
        if (activeConversationId === currentIdInUrl) return;

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

    return (
        <div className="h-full px-3 py-4 md:px-6 md:py-6 bg-slate-50">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:h-full lg:flex-row">
                <aside className="flex w-full flex-col overflow-hidden rounded-xl border border-buzz-blue/10 lg:w-95 bg-white">
                    <div className="border-b border-buzz-blue/10 px-5 py-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-buzz-gold">
                            Messages
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-buzz-blue">
                            Your inbox
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Start a conversation with anyone on BuzzFinder.
                        </p>
                    </div>

                    <ChatNewConversationSearch
                        users={users}
                        conversationItems={conversationItems}
                        pendingConversation={pendingConversation}
                        currentUser={currentUser}
                        setPendingConversation={setPendingConversation}
                        setActiveConversationId={setActiveConversationId}
                    />

                    <ChatConversationsList
                        key={conversationItems.length}
                        conversationItems={conversationItems}
                        activeConversationId={activeConversationId}
                        setPendingConversation={setPendingConversation}
                        setActiveConversationId={setActiveConversationId}
                    />
                </aside>

                <ChatWindow
                    conversationItems={conversationItems}
                    currentUser={currentUser}
                    activeConversationId={activeConversationId}
                    initialMessages={initialMessages}
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
