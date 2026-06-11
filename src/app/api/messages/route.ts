import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import { toChatMessageSummary } from "@/lib/chat";
import Conversation from "@/model/Conversation";
import Message from "@/model/Message";
import { pusherServer } from "@/model/pusherServer";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

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

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return new NextResponse("Conversation not found", { status: 404 });
        }

        if (!conversation.participants.some((p: { userId: string; lastReadAt: Date | string }) => p.userId === userId)) {
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

        await Promise.all([
            pusherServer.trigger(
                `conversation-${conversationId}`,
                "new-message",
                messagePayload,
            ),

            ...conversation.participants.map((participant: { userId: string; lastReadAt: Date | string }) =>
                pusherServer.trigger(
                    `inbox-${participant.userId.toString()}`,
                    "conversation-updated",
                    { conversationId }
                )
            ),
        ]);

        return NextResponse.json(messagePayload, { status: 201 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}