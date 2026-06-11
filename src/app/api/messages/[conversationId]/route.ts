import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import { toChatMessageSummary } from "@/lib/chat";
import Conversation, { ConversationType } from "@/model/Conversation"; // ✨ Imported ConversationType
import Message from "@/model/Message";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Lean message shape wrapper
interface LeanMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?._id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();
        const { conversationId } = await params;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return new NextResponse("Invalid conversation", { status: 400 });
        }

        // ✨ Tell lean exactly what single object type this returns
        const conversation = await Conversation.findById(conversationId).lean<ConversationType>();

        if (!conversation) {
            return new NextResponse("Conversation not found", { status: 404 });
        }

        if (!conversation.participants.some((p) => p.userId === session.user?._id)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const messages = await Message.find({
            conversationId: conversationId,
        })
            .sort({ createdAt: "asc" })
            .lean<LeanMessage[]>(); // ✨ Typed as an array of messages

        return NextResponse.json(
            messages.map((message) => toChatMessageSummary(message)),
        );
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}