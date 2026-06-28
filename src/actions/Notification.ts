"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongo";
import User from "@/model/User";
import Notification, { NotificationType } from "@/model/Notification";
import { pusherServer } from "@/model/pusherServer";
import { PlainNotification } from "@/model/Notification";
import { getTextFromNode, NOTIFICATION_CONFIG } from "@/lib/notificationConfig";
import { sendPushToUser } from "./Push";

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

export async function sendNotification({
    recipient,
    actor,
    resource,
    resourceType,
    notificationType,
    body,
}: Partial<PlainNotification>) {
    const session = await auth();
    const userId = session?.user?._id;

    if (recipient?.toString() === userId?.toString()) return;

    const notification = await Notification.create({
        recipient,
        actor,
        resource,
        resourceType,
        notificationType,
        body,
    });

    const populated = await Notification.findById(notification._id)
        .populate("actor", "name image")
        .populate("resource", "name image text note itemId deletedAt");

    await pusherServer.trigger(
        `user-${populated.recipient}`,
        "new-notification",
        populated,
    );

    const config = NOTIFICATION_CONFIG[populated.notificationType as NotificationType];
    const displayMessage = config.getMessage(
        populated.actor?.name || "Someone",
        populated.resource,
        populated.body,
    );
    const targetLink = config.getLink(populated.resource);
    const type = config.type;

    sendPushToUser({
        recipientId: populated.recipient,
        title: config.label,
        body: getTextFromNode(displayMessage),
        url: targetLink,
        groupId: `${populated.resourceType}:${populated.resource}`,
        notificationType: type,
    }).catch((err) =>
        console.error("Web Push Notification failed: ", err)
    );

    return populated;
}
