import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Notification from "@/model/Notification";
import { auth } from "@/auth";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

    try {
        await dbConnect();

        const session = await auth();
        if (!session?.user?._id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user._id;

        const updateData = await request.json();

        const updatedNotification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId },
            { $set: updateData },
            { new: true, runValidators: true },
        );

        if (!updatedNotification) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(updatedNotification);
    } catch (error) {
        console.error(`PATCH /api/notifications/${id} error:`, error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 },
        );
    }
}
