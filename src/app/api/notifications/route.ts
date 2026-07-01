import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Notification from "@/model/Notification";
import { auth } from "@/auth";

// Fetch all of a user's notifications from the past 30 days
export async function GET() {
    try {
        await dbConnect();
        const session = await auth();
        if (!session?.user) return NextResponse.json([]);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const notifications = await Notification.find({
            recipient: session.user._id,
            createdAt: { $gte: thirtyDaysAgo },
        })
            .populate("actor", "name image")
            .populate("resource", "name image text note itemId deletedAt itemType")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(notifications);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 },
        );
    }
}

// Bulk updates of a user's notifications
export async function PATCH(request: Request) {
    try {
        await dbConnect();

        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }
        const userId = session.user._id;

        const body = await request.json();

        await Notification.updateMany({ recipient: userId }, { $set: body });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("PATCH /api/notifications error:", e);
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
            });
        }
        return new Response(
            JSON.stringify({ error: "Failed to update notification." }),
            { status: 500 },
        );
    }
}
