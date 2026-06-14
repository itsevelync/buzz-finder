import {
    ChatMessageSummary,
    ChatUserSummary,
    ConversationSummary,
} from "@/lib/chat";
import { LuChevronLeft, LuSend } from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";
import {
    Dispatch,
    useCallback,
    SetStateAction,
    UIEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { pusherClient } from "@/lib/pusherClient";
import { markAsRead } from "@/actions/Chat";

const MESSAGE_PAGE_SIZE = 10;

type ChatWindowProps = {
    conversationItems: ConversationSummary[];
    currentUser: ChatUserSummary;
    activeConversationId: string | null;
    setActiveConversationId: (value: SetStateAction<string | null>) => void;
    refreshConversations: () => Promise<void>;
    setConversationList: Dispatch<SetStateAction<ConversationSummary[]>>;
    pendingConversation: ConversationSummary | null;
    setPendingConversation: Dispatch<
        SetStateAction<ConversationSummary | null>
    >;
    messageCache: Record<string, ChatMessageSummary[]>;
    setMessageCache: Dispatch<
        SetStateAction<Record<string, ChatMessageSummary[]>>
    >;
};

function dedupeAndSortMessages(messages: ChatMessageSummary[]) {
    const messagesById = new Map<string, ChatMessageSummary>();

    for (const message of messages) {
        messagesById.set(message._id, message);
    }

    return Array.from(messagesById.values()).sort((left, right) => {
        const timeDifference =
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime();

        if (timeDifference !== 0) {
            return timeDifference;
        }

        return left._id.localeCompare(right._id);
    });
}

export default function ChatWindow({
    conversationItems,
    currentUser,
    activeConversationId,
    setActiveConversationId,
    refreshConversations,
    setConversationList,
    pendingConversation,
    setPendingConversation,
    messageCache,
    setMessageCache,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<ChatMessageSummary[]>([]);
    const [draftMessage, setDraftMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesScrollContainerRef = useRef<HTMLDivElement | null>(null);
    const scrollBehaviorRef = useRef<"auto" | "smooth" | null>(null);

    const messageGroups = useMemo(() => {
        const groups: { time: string; items: ChatMessageSummary[] }[] = [];

        for (const msg of messages) {
            if (groups.length === 0) {
                groups.push({ time: msg.createdAt, items: [msg] });
                continue;
            }

            const lastGroup = groups[groups.length - 1];
            const lastMsg = lastGroup.items[lastGroup.items.length - 1];

            const lastTime = new Date(lastMsg.createdAt).getTime();
            const curTime = new Date(msg.createdAt).getTime();

            // Break group if more than one hour has passed
            if (curTime - lastTime > 1000 * 60 * 60) {
                groups.push({ time: msg.createdAt, items: [msg] });
            } else {
                lastGroup.items.push(msg);
            }
        }

        return groups;
    }, [messages]);

    const updateCachedMessages = useCallback(
        (conversationId: string, nextMessages: ChatMessageSummary[]) => {
            setMessageCache((current) => ({
                ...current,
                [conversationId]: dedupeAndSortMessages(nextMessages),
            }));
        },
        [setMessageCache],
    );

    const fetchMessagePage = useCallback(
        async (
            conversationId: string,
            options?: { before?: string; limit?: number },
        ) => {
            const searchParams = new URLSearchParams();
            searchParams.set(
                "limit",
                String(options?.limit ?? MESSAGE_PAGE_SIZE),
            );

            if (options?.before) {
                searchParams.set("before", options.before);
            }

            const response = await fetch(
                `/api/messages/${conversationId}?${searchParams.toString()}`,
            );

            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }

            return (await response.json()) as ChatMessageSummary[];
        },
        [],
    );

    const loadMessages = useCallback(
        async (conversationId: string) => {
            if (conversationId.startsWith("pending-")) {
                setMessages([]);
                setHasMoreOlderMessages(false);
                return;
            }

            setIsLoadingMessages(true);

            try {
                const cachedMessages = messageCache[conversationId];

                if (cachedMessages) {
                    setMessages(cachedMessages);
                    setHasMoreOlderMessages(
                        cachedMessages.length >= MESSAGE_PAGE_SIZE,
                    );
                    scrollBehaviorRef.current = "auto";
                    return;
                }

                const data = await fetchMessagePage(conversationId);
                setMessages(data);
                setHasMoreOlderMessages(data.length >= MESSAGE_PAGE_SIZE);
                updateCachedMessages(conversationId, data);
                scrollBehaviorRef.current = "smooth";
            } catch (error) {
                console.error(error);
                setMessages([]);
                setHasMoreOlderMessages(false);
            } finally {
                setIsLoadingMessages(false);
            }
        },
        [fetchMessagePage, messageCache, updateCachedMessages],
    );

    const loadOlderMessages = async () => {
        if (
            !activeConversationId ||
            activeConversationId.startsWith("pending-") ||
            isLoadingMessages ||
            isLoadingOlderMessages ||
            !hasMoreOlderMessages ||
            messages.length === 0
        ) {
            return;
        }

        const oldestMessage = messages[0];
        const scrollContainer = messagesScrollContainerRef.current;
        const previousScrollHeight = scrollContainer?.scrollHeight ?? 0;
        const previousScrollTop = scrollContainer?.scrollTop ?? 0;

        setIsLoadingOlderMessages(true);

        try {
            const olderMessages = await fetchMessagePage(activeConversationId, {
                before: oldestMessage.createdAt,
            });

            if (olderMessages.length === 0) {
                setHasMoreOlderMessages(false);
                return;
            }

            setMessages((current) =>
                dedupeAndSortMessages([...olderMessages, ...current]),
            );

            if (olderMessages.length < MESSAGE_PAGE_SIZE) {
                setHasMoreOlderMessages(false);
            }

            scrollBehaviorRef.current = null;

            requestAnimationFrame(() => {
                if (!scrollContainer) {
                    return;
                }

                const nextScrollHeight = scrollContainer.scrollHeight;
                scrollContainer.scrollTop =
                    nextScrollHeight - previousScrollHeight + previousScrollTop;
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingOlderMessages(false);
        }
    };

    useEffect(() => {
        if (!activeConversationId) return;

        const conversationChannel = pusherClient.subscribe(
            `conversation-${activeConversationId}`,
        );

        const handleNewMessage = (message: ChatMessageSummary) => {
            scrollBehaviorRef.current = "smooth";

            setMessages((current) =>
                dedupeAndSortMessages([...current, message]),
            );

            if (
                message.conversationId === activeConversationId &&
                document.hasFocus()
            ) {
                void markAsRead(activeConversationId);
            }

            void refreshConversations();
        };

        conversationChannel.bind("new-message", handleNewMessage);

        return () => {
            conversationChannel.unbind("new-message", handleNewMessage);
            pusherClient.unsubscribe(`conversation-${activeConversationId}`);
        };
    }, [activeConversationId, refreshConversations]);

    useEffect(() => {
        if (!activeConversationId) return;

        const performMarkAsRead = () => {
            markAsRead(activeConversationId);
        };

        const handleFocus = () => {
            performMarkAsRead();
        };
        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [activeConversationId, messages]);

    useEffect(() => {
        if (!activeConversationId) {
            setMessages([]);
            setHasMoreOlderMessages(true);
            return;
        }

        void loadMessages(activeConversationId);
    }, [activeConversationId, loadMessages]);

    useEffect(() => {
        // If no scroll was requested, don't do anything
        if (!scrollBehaviorRef.current) return;

        const currentBehavior = scrollBehaviorRef.current;

        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: currentBehavior,
                });

                // Clear the request so it doesn't fire aggressively on unrelated re-renders
                scrollBehaviorRef.current = null;
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [messages]);

    const upsertConversation = (nextConversation: ConversationSummary) => {
        setConversationList((current) => {
            const filtered = current.filter(
                (conversation) => conversation._id !== nextConversation._id,
            );

            return [nextConversation, ...filtered].sort(
                (left, right) =>
                    new Date(right.lastMessageAt).getTime() -
                    new Date(left.lastMessageAt).getTime(),
            );
        });
    };

    const handleMessageScroll = (event: UIEvent<HTMLDivElement>) => {
        if (event.currentTarget.scrollTop <= 80) {
            void loadOlderMessages();
        }
    };

    const activeConversation = useMemo(() => {
        const fromList =
            conversationItems.find(
                (conversation) => conversation._id === activeConversationId,
            ) ?? null;

        if (fromList) {
            return fromList;
        }

        if (pendingConversation?._id === activeConversationId) {
            return pendingConversation;
        }

        return null;
    }, [conversationItems, activeConversationId, pendingConversation]);

    const activePartner = activeConversation?.partner ?? null;

    const sendMessage = async (event?: React.SubmitEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();

        const trimmedMessage = draftMessage.trim();

        if (!trimmedMessage || !activeConversationId) {
            return;
        }

        setIsSending(true);

        try {
            let conversationId = activeConversationId;

            // If this is a pending conversation, create it first.
            if (conversationId.startsWith("pending-")) {
                // Prefer participant id from pendingConversation if available.
                const participantId =
                    pendingConversation?.participants?.find(
                        (p) => p.userId !== currentUser._id,
                    )?.userId || conversationId.replace("pending-", "");

                const convRes = await fetch("/api/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ participantId }),
                });

                if (!convRes.ok) {
                    throw new Error("Failed to create conversation");
                }

                const conv = (await convRes.json()) as ConversationSummary;
                upsertConversation(conv);
                conversationId = conv._id;
                setActiveConversationId(conversationId);

                // Clear the local pending marker now that the real conversation exists.
                setPendingConversation(null);
            }

            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, text: trimmedMessage }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            await response.json();
            setDraftMessage("");
            markAsRead(conversationId);
            await refreshConversations();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    function formatGroupTimestamp(dateValue: string) {
        const d = new Date(dateValue);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        const isSameDay = d.toDateString() === now.toDateString();
        const isYesterday = d.toDateString() === yesterday.toDateString();

        const time = new Intl.DateTimeFormat("en", {
            hour: "numeric",
            minute: "2-digit",
        }).format(d);

        if (isSameDay) {
            return `Today, ${time}`;
        }

        if (isYesterday) {
            return `Yesterday, ${time}`;
        }

        return new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(d);
    }

    function formatRelativeTime(dateValue: string) {
        const then = new Date(dateValue).getTime();
        const now = Date.now();
        const diff = Math.max(0, now - then);

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return "Just now";
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days === 1)
            return `Yesterday ${new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(dateValue))}`;

        return new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(dateValue));
    }

    return (
        <section className="flex h-full flex-1 flex-col bg-white/90">
            {activeConversationId ? (
                <>
                    <header className="flex items-center gap-2 border-b border-buzz-blue/10 py-3 px-3 md:px-4">
                        <button
                            onClick={() => {
                                setActiveConversationId(null);
                                setPendingConversation(null);
                            }}
                            className="rounded-full p-1 text-gray-600 hover:bg-gray-100 active:bg-gray-200 md:hidden transition-colors"
                            aria-label="Back to messages"
                        >
                            <LuChevronLeft size={24} />
                        </button>
                        {activePartner ? (
                            <Link href={`user/${activePartner.username}`}>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-buzz-blue/10 text-buzz-blue">
                                        {activePartner.image ? (
                                            <Image
                                                src={activePartner.image}
                                                alt={activePartner.name}
                                                width={50}
                                                height={50}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-semibold">
                                                {activePartner.name
                                                    ?.slice(0, 1)
                                                    .toUpperCase() ?? "B"}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-buzz-blue">
                                            {activePartner.name}
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {`@${activePartner.username}`}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div>
                                <h2 className="text-xl font-semibold text-buzz-blue">
                                    Unknown User
                                </h2>
                            </div>
                        )}
                    </header>

                    <div
                        ref={messagesScrollContainerRef}
                        onScroll={handleMessageScroll}
                        className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.98))] px-4 py-5 md:px-6"
                    >
                        <div className="space-y-3">
                            {isLoadingMessages && (
                                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                                    Loading messages...
                                </div>
                            )}

                            {!isLoadingMessages &&
                                isLoadingOlderMessages &&
                                messages.length > 0 && (
                                    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                                        Loading older messages...
                                    </div>
                                )}

                            {!isLoadingMessages && messages.length === 0 && (
                                <div className="mx-auto mt-16 max-w-md text-center text-sm text-slate-500">
                                    This conversation is empty. Send the first
                                    message below.
                                </div>
                            )}

                            {!isLoadingMessages &&
                                messageGroups.map((group, gi) => (
                                    <div key={`group-${gi}`}>
                                        <div className="flex justify-center">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                                                {formatGroupTimestamp(
                                                    group.time,
                                                )}
                                            </span>
                                        </div>

                                        {group.items.map((message) => {
                                            const isMine =
                                                message.senderId ===
                                                currentUser._id;

                                            return (
                                                <div
                                                    key={message._id}
                                                    className={`mt-3 flex ${isMine ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`flex flex-col w-full ${isMine ? "items-end" : "items-start"}`}
                                                    >
                                                        <div
                                                            className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[68%] ${
                                                                isMine
                                                                    ? "rounded-br-xs bg-buzz-blue text-white"
                                                                    : "rounded-bl-xs border border-slate-200 bg-white text-slate-800"
                                                            }`}
                                                        >
                                                            <p className="whitespace-pre-wrap wrap-break-word">
                                                                {message.text}
                                                            </p>
                                                        </div>

                                                        <div className="mt-1 text-[11px] text-slate-400">
                                                            {formatRelativeTime(
                                                                message.createdAt,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <form
                        onSubmit={(event) => void sendMessage(event)}
                        className="border-t border-buzz-blue/10 bg-white px-4 py-4 md:py-4.5 md:px-5"
                    >
                        <textarea
                            value={draftMessage}
                            onChange={(event) =>
                                setDraftMessage(event.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (
                                        !isSending &&
                                        activeConversationId &&
                                        draftMessage.trim()
                                    ) {
                                        void sendMessage();
                                    }
                                }
                            }}
                            placeholder={
                                activeConversationId
                                    ? "Type a message..."
                                    : "Pick a conversation first"
                            }
                            rows={4}
                            disabled={!activeConversationId || isSending}
                            className="relative w-full border rounded border-foreground/20 p-2 resize-none text-sm text-slate-700 placeholder:text-slate-400 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={
                                !activeConversationId ||
                                !draftMessage.trim() ||
                                isSending
                            }
                            className="absolute bottom-8 right-7 rounded-lg bg-buzz-blue p-2 text-md font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <LuSend />
                        </button>

                        <div className="absolute right-5 bottom-3.5 text-[10px] text-slate-400">
                            {draftMessage.trim() && (
                                <p className="-my-2 text-right">
                                    <b>Shift + Enter</b> to add a new line
                                </p>
                            )}
                        </div>
                    </form>
                </>
            ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-xl px-6 py-12 text-center">
                    <div className="max-w-md">
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Select a conversation from the left panel.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
