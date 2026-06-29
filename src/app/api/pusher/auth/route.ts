import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pusherServer } from "@/model/pusherServer";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?._id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.formData();

    const socketId = body.get("socket_id") as string;
    const channel = body.get("channel_name") as string;

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
        user_id: session.user._id.toString(),
        user_info: {
            name: session.user.name,
        },
    });

    return NextResponse.json(authResponse);
}
