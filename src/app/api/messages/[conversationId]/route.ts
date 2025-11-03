import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Message from '@/model/message.model';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    await dbConnect();
    const { conversationId } = params;

    const messages = await Message.find({
      conversationId: conversationId,
    }).sort({ createdAt: 'asc' }); // Get oldest first

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}