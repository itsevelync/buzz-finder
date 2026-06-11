export type ChatUserSummary = {
    _id: string;
    name: string;
    username: string;
    image?: string | null;
};

export type ChatMessageSummary = {
    _id: string;
    text: string;
    senderId: string;
    conversationId: string;
    createdAt: string;
};

export type ConversationSummary = {
    _id: string;
    participants: { userId: string; lastReadAt: Date | string }[];
    lastMessageAt: string;
    partner: ChatUserSummary | null;
    lastMessage: ChatMessageSummary | null;
};

export function toChatUserSummary(user: {
    _id: { toString: () => string } | string;
    name: string;
    username: string;
    image?: string | null;
}): ChatUserSummary {
    return {
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        image: user.image ?? null,
    };
}

export function toChatMessageSummary(message: {
    _id: { toString: () => string } | string;
    text: string;
    senderId: { toString: () => string } | string;
    conversationId: { toString: () => string } | string;
    createdAt: Date | string;
}): ChatMessageSummary {
    return {
        _id: message._id.toString(),
        text: message.text,
        senderId: message.senderId.toString(),
        conversationId: message.conversationId.toString(),
        createdAt: new Date(message.createdAt).toISOString(),
    };
}
