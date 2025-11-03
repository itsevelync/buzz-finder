import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Message from '@/model/message.model';
import { pusherServer } from '@/model/pusherServer';
import Conversation from '@/model/conversation.model';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { text, senderId, conversationId } = body;

    if (!text || !senderId || !conversationId) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    // 1. Create and save the new message to MongoDB
    const newMessage = await Message.create({
      text,
      senderId,
      conversationId,
    });

    // 2. Update the conversation's lastMessageAt timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
    });

    // 3. Trigger Pusher to broadcast the new message
    // The channel is the conversationId, the event is 'new-message'
    await pusherServer.trigger(
      conversationId,
      'new-message',
      newMessage
    );

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}