import { auth } from "@/auth";
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
import { pusherServer } from "@/model/pusherServer";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface LeanMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

type UserSearchResult = Pick<UserType, "_id" | "name" | "username" | "image">;

function createConversationSummary(
    conversation: {
        _id: { toString: () => string } | string;
        participants: { userId: string; lastReadAt: Date | string }[];
        lastMessageAt: Date | string;
    },
    partner: ChatUserSummary | null,
    lastMessage: ChatMessageSummary | null,
): ConversationSummary {
    return {
        _id: conversation._id.toString(),
        participants: conversation.participants.map((participant) => ({
            userId: participant.userId.toString(),
            lastReadAt: participant.lastReadAt,
        })),
        lastMessageAt: new Date(conversation.lastMessageAt).toISOString(),
        partner,
        lastMessage,
    };
}

export async function GET(request: NextRequest) {
    const session = await auth();
    const userId = session?.user?._id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");

    await dbConnect();

    // Case A: If a partnerId is provided, find that specific 1-on-1 conversation
    if (partnerId) {
        const conversation = await Conversation.findOne({
            participants: {
                $size: 2, // Ensures it's a direct 1-on-1 chat
                $all: [
                    { $elemMatch: { userId: userId } },
                    { $elemMatch: { userId: partnerId } },
                ],
            },
        })
            .select("_id")
            .lean<{ _id: string }>();

        if (!conversation) {
            return NextResponse.json({ conversationId: null }, { status: 404 });
        }

        return NextResponse.json(
            { conversationId: conversation._id.toString() },
            { status: 200 },
        );
    }

    // Case B: Fetch ALL conversations
    const conversations = await Conversation.find({
        "participants.userId": userId,
    })
        .sort({ lastMessageAt: -1 })
        .lean<ConversationType[]>();

    const conversationIds = conversations.map((conversation) =>
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

    const partnerIds = Array.from(
        new Set(
            conversations.flatMap((conversation) =>
                conversation.participants
                    .map((p) => p.userId.toString())
                    .filter((id) => id !== userId),
            ),
        ),
    );

    const partners = partnerIds.length
        ? await User.find({ _id: { $in: partnerIds } })
              .select("name username image")
              .lean<UserSearchResult[]>()
        : [];

    const partnersById = new Map<string, ChatUserSummary>();
    for (const partner of partners) {
        const summary = toChatUserSummary(partner);
        partnersById.set(summary._id, summary);
    }

    const conversationSummaries = conversations.map((conversation) => {
        const partner = conversation.participants.find(
            (participant) => participant.userId !== userId,
        );

        const partnerId = partner?.userId;

        return createConversationSummary(
            conversation,
            partnerId ? (partnersById.get(partnerId) ?? null) : null,
            latestMessageByConversation.get(conversation._id.toString()) ??
                null,
        );
    });

    return NextResponse.json(conversationSummaries, { status: 200 });
}

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?._id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const participantId = body.participantId;

    if (
        typeof participantId !== "string" ||
        !mongoose.Types.ObjectId.isValid(participantId) ||
        participantId === userId
    ) {
        return NextResponse.json(
            { error: "Invalid participant" },
            { status: 400 },
        );
    }

    const participant = await User.findById(participantId)
        .select("name username image")
        .lean<UserSearchResult>();

    if (!participant) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingConversation = await Conversation.findOne({
        $and: [
            { participants: { $elemMatch: { userId: userId } } },
            { participants: { $elemMatch: { userId: participantId } } },
            { participants: { $size: 2 } }, // Ensures it's a 1-on-1 chat, not a group chat
        ],
    }).lean<ConversationType>();

    const conversation: ConversationType =
        existingConversation ??
        (await Conversation.create({
            participants: [
                { userId: userId, lastReadAt: new Date() },
                { userId: participantId, lastReadAt: new Date() },
            ],
            lastMessageAt: new Date(),
        }).then(
            (createdConversation) =>
                createdConversation.toObject() as ConversationType,
        ));

    const conversationSummary = createConversationSummary(
        conversation,
        toChatUserSummary(participant),
        null,
    );

    await Promise.all([
        pusherServer.trigger(`inbox-${userId}`, "conversation-updated", {
            conversationId: conversationSummary._id,
        }),
        pusherServer.trigger(`inbox-${participantId}`, "conversation-updated", {
            conversationId: conversationSummary._id,
        }),
    ]);

    return NextResponse.json(conversationSummary, { status: 200 });
}
