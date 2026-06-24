import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import { isUserInConversation, toChatMessageSummary } from "@/lib/chat";
import Conversation, { ConversationType } from "@/model/Conversation";
import Message from "@/model/Message";
import { pusherServer } from "@/model/pusherServer";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { sendPushToUsers } from "@/actions/Push";

export async function POST(request: Request) {
    try {
        const session = await auth();
        const userId = session?.user?._id;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { text, conversationId } = body;

        if (
            typeof text !== "string" ||
            typeof conversationId !== "string" ||
            !text.trim() ||
            !mongoose.Types.ObjectId.isValid(conversationId)
        ) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const conversation = await Conversation.findById(conversationId).lean<ConversationType>();

        if (!conversation) {
            return new NextResponse("Conversation not found", { status: 404 });
        }

        if (!conversation.participants.some((p: { userId: string }) => p.userId.toString() === userId.toString())) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const newMessage = await Message.create({
            text: text.trim(),
            senderId: userId,
            conversationId,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessageAt: new Date(),
        });

        const messagePayload = toChatMessageSummary(newMessage.toObject());

        // Trigger Pusher Events for real-time app layout updates
        await Promise.all([
            pusherServer.trigger(
                `conversation-${conversationId}`,
                "new-message",
                messagePayload,
            ),

            ...conversation.participants.map((participant: { userId: string }) =>
                pusherServer.trigger(
                    `inbox-${participant.userId.toString()}`,
                    "conversation-updated",
                    { conversationId }
                )
            ),
        ]);

        // --- WEB PUSH NOTIFICATION SYSTEM ---
        // 1. Identify all other participants besides the current sender
        const recipientIds = conversation.participants
            .map((p: { userId: string }) => p.userId.toString())
            .filter((id: string) => id !== userId.toString());

        if (recipientIds.length > 0) {
            // 2. Fire and forget the push notification safely so it doesn't slow down the HTTP response
            let shouldSendPush = true;

            for (const recipientId of recipientIds) {
                const isActive = await isUserInConversation(
                    conversationId,
                    recipientId
                );

                if (isActive) {
                    shouldSendPush = false;
                    break;
                }
            }

            if (shouldSendPush && recipientIds.length > 0) {
                sendPushToUsers({
                    userIds: recipientIds,
                    title: session.user?.name || "New Message",
                    body:
                        text.trim().length > 60
                            ? `${text.trim().substring(0, 60)}...`
                            : text.trim(),
                    url: `/messages/${conversationId}`,
                    groupId: `conversation:${conversationId}`,
                    notificationType: "messages",
                }).catch((err) =>
                    console.error("Web Push Notification failed: ", err)
                );
            }
        }
        // ------------------------------------

        return NextResponse.json(messagePayload, { status: 201 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}