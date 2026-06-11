import { auth } from "@/auth";
import ChatPageClient from "@/components/chat/ChatPageClient";
import { dbConnect } from "@/lib/mongo";
import {
    ChatMessageSummary,
    ChatUserSummary,
    ConversationSummary,
    toChatMessageSummary,
    toChatUserSummary,
} from "@/lib/chat";
import Conversation, { ConversationType } from "@/model/Conversation";
import Message from "@/model/Message";
import User, { User as UserType } from "@/model/User";
import { redirect } from "next/navigation";

interface LeanMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export default async function ChatPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const session = await auth();

    if (!session?.user?._id) {
        redirect("/login");
    }

    await dbConnect();
    const resolvedSearchParams = await searchParams;

    const currentUser = toChatUserSummary({
        _id: session.user._id,
        name: session.user.name ?? "You",
        username: session.user.username ?? "",
        image: session.user.image ?? null,
    });

    type UserSearchResult = Pick<
        UserType,
        "_id" | "name" | "username" | "image"
    >;

    const users = await User.find({ _id: { $ne: currentUser._id } })
        .select("name username image")
        .sort({ name: 1 })
        .lean<UserSearchResult[]>();

    const conversationDocs = await Conversation.find({
        "participants.userId": currentUser._id.toString(), // Dot notation + string ID
    })
        .sort({ lastMessageAt: -1 })
        .lean<ConversationType[]>();

    const conversationIds = conversationDocs.map((conversation) =>
        conversation._id.toString(),
    );

    const lastMessages = conversationIds.length
        ? await Message.find({ conversationId: { $in: conversationIds } })
              .sort({ createdAt: -1 })
              .lean<LeanMessage[]>()
        : [];

    const latestMessageByConversation = new Map<string, ChatMessageSummary>();
    for (const message of lastMessages) {
        const summarizedMessage = toChatMessageSummary(message);
        if (
            !latestMessageByConversation.has(summarizedMessage.conversationId)
        ) {
            latestMessageByConversation.set(
                summarizedMessage.conversationId,
                summarizedMessage,
            );
        }
    }

    const usersById = new Map<string, ChatUserSummary>();
    for (const user of users) {
        const summary = toChatUserSummary(user);
        usersById.set(summary._id, summary);
    }

    const conversations: ConversationSummary[] = conversationDocs.map(
        (conversation) => {
            const conversationId = conversation._id.toString();

            const partnerId = conversation.participants.find(
                (p) => p.userId !== currentUser._id,
            )?.userId;

            return {
                _id: conversationId,
                participants: conversation.participants.map((p) => ({
                    userId: p.userId.toString(),
                    lastReadAt: new Date(p.lastReadAt).toISOString(),
                })),
                lastMessageAt: new Date(
                    conversation.lastMessageAt,
                ).toISOString(),
                partner: partnerId ? (usersById.get(partnerId) ?? null) : null,
                lastMessage:
                    latestMessageByConversation.get(conversationId) ?? null,
            };
        },
    );

    const validId = conversations.some(
        (item) => item._id === resolvedSearchParams.id,
    );

    const initialConversationId = validId ? resolvedSearchParams.id : null;

    return (
        <ChatPageClient
            currentUser={currentUser}
            users={users.map((user) => toChatUserSummary(user))}
            conversations={conversations}
            initialConversationId={initialConversationId}
        />
    );
}
