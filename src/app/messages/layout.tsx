import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import {
    toChatUserSummary,
    toChatMessageSummary,
    ChatMessageSummary,
} from "@/lib/chat";
import Conversation, { ConversationType } from "@/model/Conversation";
import Message from "@/model/Message";
import User, { User as UserType } from "@/model/User";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { ChatProvider } from "@/context/ChatContext";
import ChatSidebarShell from "@/components/chat/ChatSidebarShell";

export const metadata: Metadata = {
    title: "Messages - BuzzFinder",
};

interface LeanMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?._id) {
        redirect("/login");
    }

    await dbConnect();

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
        "participants.userId": currentUser._id.toString(),
    })
        .sort({ lastMessageAt: -1 })
        .lean<ConversationType[]>();

    const conversationIds = conversationDocs.map((c) => c._id.toString());

    // 1. Bring back the server-side query for last messages across all rooms
    const lastMessages = conversationIds.length
        ? await Message.find({ conversationId: { $in: conversationIds } })
              .sort({ createdAt: -1 })
              .lean<LeanMessage[]>()
        : [];

    // 2. Map the latest messages by their conversation ID
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

    const mappedUsers = users.map((u) => toChatUserSummary(u));

    // 3. Construct the initial conversations array containing the message previews
    const mappedConversations = conversationDocs.map((conv) => {
        const convId = conv._id.toString();
        const partnerId = conv.participants.find(
            (p) => p.userId !== currentUser._id,
        )?.userId;
        const targetPartner =
            mappedUsers.find((u) => u._id === partnerId) ?? null;

        return {
            _id: convId,
            participants: conv.participants.map((p) => ({
                userId: p.userId.toString(),
                lastReadAt: new Date(p.lastReadAt).toISOString(),
            })),
            lastMessageAt: new Date(conv.lastMessageAt).toISOString(),
            partner: targetPartner,
            lastMessage: latestMessageByConversation.get(convId) ?? null, // Populated here!
        };
    });

    return (
        <ChatProvider
            currentUser={currentUser}
            users={mappedUsers}
            initialConversations={mappedConversations}
        >
            <div className="flex h-full w-full overflow-hidden relative">
                <ChatSidebarShell />
                {children}
            </div>
        </ChatProvider>
    );
}
