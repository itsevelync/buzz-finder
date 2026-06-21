"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import User from "@/model/User";

export async function updateNotificationPreferences(preferences: {
    pushEnabled?: boolean;
    messages?: boolean;
    newItemNotes?: boolean;
    itemStatusUpdates?: boolean;
}) {
    const session = await auth();
    const userId = session?.user?._id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    // Create dot-notation update object to safely modify nested properties
    const updatePayload: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(preferences)) {
        updatePayload[`notificationPreferences.${key}`] = value;
    }

    await User.findByIdAndUpdate(userId, {
        $set: updatePayload,
    });

    return { success: true };
}
