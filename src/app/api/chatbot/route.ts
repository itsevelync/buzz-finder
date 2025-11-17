import { NextResponse } from "next/server";
import { getChatbotReply } from "@/lib/chatbot_buzz/match";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid `message` in request body." },
        { status: 400 }
      );
    }

    const result = getChatbotReply(message);

    return NextResponse.json(
      {
        reply: result.reply,
        intent: result.intent,
        confidence: result.confidence
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Chatbot API error:", err);
    return NextResponse.json(
      { error: "Failed to process chatbot request." },
      { status: 500 }
    );
  }
}

// Optional: reject other HTTP methods
export function GET() {
  return NextResponse.json(
    { message: "Use POST /api/chatbot with { message: string }" },
    { status: 200 }
  );
}
