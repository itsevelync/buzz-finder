"use server";

import webpush from "web-push";
import { auth } from "@/auth";
import PushSubscription from "@/model/PushSubscription";
import User from "@/model/User";
import { dbConnect } from "@/lib/mongo";
import Notification, { NotificationType } from "@/model/Notification";
import { pusherServer } from "@/model/pusherServer";
import { PlainNotification } from "@/model/Notification";
import { getTextFromNode, NOTIFICATION_CONFIG } from "@/lib/notificationConfig";

webpush.setVapidDetails(
    "mailto:buzzfinder404@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
);

async function requireUserId() {
    const session = await auth();
    const userId = session?.user?._id;

    if (!userId) {
        throw new Error("Unauthorized. Please log in.");
    }

    return userId;
}

// Subscribes user to push notifications
export async function subscribeUser(sub: webpush.PushSubscription) {
    const userId = await requireUserId();

    await PushSubscription.updateOne(
        { endpoint: sub.endpoint },
        {
            $set: {
                userId,
                endpoint: sub.endpoint,
                keys: sub.keys,
            },
        },
        { upsert: true },
    );

    return { success: true };
}

// Unsubscribes user from push notifications
export async function unsubscribeUser(endpoint: string) {
    const userId = await requireUserId();

    await PushSubscription.deleteOne({
        userId,
        endpoint,
    });

    return { success: true };
}

// Sends a push notification to a single user
export async function sendPushToUser({
    recipientId,
    title,
    body,
    url,
    groupId,
    tag,
    notificationType,
}: {
    recipientId: string;
    title: string;
    body: string;
    url: string;
    tag?: string;
    groupId: string;
    notificationType: string;
}) {
    // 1. Check if the recipient has notifications enabled for the notification type
    const recipient = await User.findById(recipientId).select(
        "notificationPreferences",
    );

    if (!recipient) return { success: false, error: "User not found" };

    const prefs = recipient.notificationPreferences;
    if (!prefs?.pushEnabled || !prefs?.[notificationType]) {
        return { success: false, error: "User disabled message notifications" };
    }

    // 2. Fetch all active push subscriptions for this recipient
    const subscriptions = await PushSubscription.find({ userId: recipientId });
    if (!subscriptions.length)
        return { success: true, message: "No active subscriptions" };

    const payload = JSON.stringify({ title, body, url, tag, groupId });

    // 3. Send to all devices registered by this user
    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: sub.keys,
                },
                payload,
            ),
        ),
    );

    return { success: true, results };
}

// Send push notifications to a list of users
export async function sendPushToUsers({
    userIds,
    title,
    body,
    url,
    groupId,
    tag,
    notificationType,
}: {
    userIds: string[];
    title: string;
    body: string;
    url: string;
    tag?: string;
    groupId: string;
    notificationType: string;
}) {
    if (!userIds.length) return;

    // 1. Filter target users who have notifications turned on for the notification type
    const eligibleUsers = await User.find({
        _id: { $in: userIds },
        "notificationPreferences.pushEnabled": true,
        [`notificationPreferences.${notificationType}`]: true,
    }).select("_id");

    const recipientIds = eligibleUsers.map((u) => u._id.toString());
    if (!recipientIds.length) return;

    // 2. Fetch all active device push subscriptions for those users
    const subscriptions = await PushSubscription.find({
        userId: { $in: recipientIds },
    });

    if (!subscriptions.length) return;

    const payload = JSON.stringify({ title, body, url, tag, groupId });

    // 3. Send notifications to all registered endpoints asynchronously
    await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: sub.keys,
                },
                payload,
            ),
        ),
    );
}

// Update a user's web and push notification preferences
export async function updateNotificationPreferences(preferences: {
    pushEnabled?: boolean;
    messages?: boolean;
    newItemNotes?: boolean;
    itemStatusUpdates?: boolean;
}) {
    const userId = await requireUserId();

    await dbConnect();

    const updatePayload: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(preferences)) {
        updatePayload[`notificationPreferences.${key}`] = value;
    }

    await User.findByIdAndUpdate(userId, {
        $set: updatePayload,
    });

    return { success: true };
}

// Sends a web and push notification to the recipient
export async function sendNotification({
    recipient,
    actor,
    resource,
    resourceType,
    notificationType,
    body,
}: Partial<PlainNotification>) {
    if (!recipient?.toString() || !notificationType) return;

    const session = await auth();
    const userId = session?.user?._id;

    if (recipient.toString() === userId?.toString()) return;

    const config = NOTIFICATION_CONFIG[notificationType as NotificationType];
    const type = config.type;

    const allowed = await _canReceiveNotification(recipient.toString(), type);
    if (!allowed) return;

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
        .populate("resource", "name image text note itemId deletedAt itemType");

    await pusherServer.trigger(
        `user-${populated.recipient}`,
        "new-notification",
        populated,
    );

    const displayMessage = config.getMessage(
        populated.actor?.name || "Someone",
        populated.resource,
        populated.body,
    );
    const targetLink = config.getLink(populated.resource, populated.body);

    sendPushToUser({
        recipientId: populated.recipient,
        title: config.label,
        body: getTextFromNode(displayMessage),
        url: targetLink,
        groupId: `${populated.resourceType}:${populated.resource}`,
        notificationType: type,
    }).catch((err) => console.error("Web Push Notification failed: ", err));

    return populated;
}

async function _canReceiveNotification(
    userId: string,
    notificationType: string,
) {
    const user = await User.findById(userId).select("notificationPreferences");

    if (!user) return false;

    const prefs = user.notificationPreferences;

    if (!prefs || !prefs.pushEnabled || !prefs[notificationType]) return false;

    return true;
}
