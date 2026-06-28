import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import Conversation from "@/model/Conversation";
import { pusherServer } from "@/model/pusherServer";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> },
) {
    const session = await auth();
    const userId = session?.user?._id;

    // 1. Authenticate user
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // 2. Validate Conversation ID format
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        return NextResponse.json(
            { error: "Invalid conversation ID" },
            { status: 400 },
        );
    }

    await dbConnect();

    // 3. Atomically find conversation and update the user's specific lastReadAt timestamp
    const updatedConversation = await Conversation.findOneAndUpdate(
        {
            _id: conversationId,
            "participants.userId": userId, // Ensures user is part of this conversation
        },
        {
            $set: { "participants.$.lastReadAt": new Date() },
        },
        { new: true }, // Returns the document after modifications
    ).lean();

    // If no document was modified, the chat either doesn't exist or the user isn't in it
    if (!updatedConversation) {
        return NextResponse.json(
            { error: "Conversation not found or access denied" },
            { status: 404 },
        );
    }

    // 4. Trigger a Pusher event
    try {
        await pusherServer.trigger(`inbox-${userId}`, "conversation-updated", {
            conversationId: conversationId,
        });
    } catch (pusherError) {
        console.error("Failed to trigger Pusher read event:", pusherError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
