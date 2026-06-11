import { ChatMessageSummary, ConversationSummary } from "@/lib/chat";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { markAsRead } from "@/actions/Chat";

type ChatConversationsListProps = {
    conversationItems: ConversationSummary[];
    activeConversationId: string | null;
    setPendingConversation: Dispatch<
        SetStateAction<ConversationSummary | null>
    >;
    setActiveConversationId: (value: SetStateAction<string | null>) => void;
};

export default function ChatConversationsList({
    conversationItems,
    activeConversationId,
    setPendingConversation,
    setActiveConversationId,
}: ChatConversationsListProps) {
    const { user } = useUser();

    function formatTime(dateValue: string) {
        return new Intl.DateTimeFormat("en", {
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(dateValue));
    }

    function formatPreview(lastMessage: ChatMessageSummary | null) {
        if (!lastMessage) {
            return "No messages yet";
        }

        return lastMessage.text.length > 48
            ? `${lastMessage.text.slice(0, 48)}...`
            : lastMessage.text;
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Conversations
                </p>
            </div>

            <div className="space-y-2">
                {conversationItems.length === 0 && (
                    <div className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                        No conversations yet. Search for someone above to start
                        a chat.
                    </div>
                )}

                {conversationItems.map((conversation) => {
                    const isActive = conversation._id === activeConversationId;

                    const myParticipantData = conversation.participants?.find(
                        (p) => p.userId === user?._id,
                    );

                    const isUnread =
                        !isActive &&
                        conversation.lastMessageAt &&
                        myParticipantData?.lastReadAt &&
                        new Date(conversation.lastMessageAt) >
                            new Date(myParticipantData.lastReadAt);

                    return (
                        <button
                            key={conversation._id}
                            type="button"
                            onClick={() => {
                                if (!conversation._id.startsWith("pending-")) {
                                    setPendingConversation(null);
                                }
                                setActiveConversationId(conversation._id);
                                markAsRead(conversation._id);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                                isActive
                                    ? "border-buzz-blue bg-buzz-blue text-white shadow shadow-buzz-blue/20"
                                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {/* Avatar Section */}
                            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-buzz-gold/15 text-sm font-semibold text-buzz-blue">
                                {conversation.partner?.image ? (
                                    <Image
                                        src={conversation.partner.image}
                                        alt={conversation.partner.name}
                                        width={50}
                                        height={50}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span>
                                        {conversation.partner?.name
                                            ?.slice(0, 1)
                                            ?.toUpperCase() ?? "?"}
                                    </span>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p
                                        className={`truncate ${isUnread ? "font-bold text-slate-900" : "font-semibold"}`}
                                    >
                                        {conversation.partner?.name ??
                                            "Unknown user"}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        {conversation.lastMessageAt && (
                                            <span
                                                className={`text-xs ${
                                                    isActive
                                                        ? "text-white/70"
                                                        : isUnread
                                                          ? "font-semibold text-buzz-blue" // Highlight time text
                                                          : "text-slate-400"
                                                }`}
                                            >
                                                {formatTime(
                                                    conversation.lastMessageAt,
                                                )}
                                            </span>
                                        )}

                                        {/* Visual indicator dot */}
                                        {isUnread && (
                                            <span className="h-2.5 w-2.5 rounded-full bg-buzz-blue animate-pulse" />
                                        )}
                                    </div>
                                </div>

                                <p
                                    className={`mt-1 truncate text-sm ${
                                        isActive
                                            ? "text-white/80"
                                            : isUnread
                                              ? "font-medium text-slate-800"
                                              : "text-slate-500"
                                    }`}
                                >
                                    {formatPreview(conversation.lastMessage)}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
