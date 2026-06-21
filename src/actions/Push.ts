"use server";

import webpush from "web-push";
import { auth } from "@/auth";
import PushSubscription from "@/model/PushSubscription";
import User from "@/model/User";

webpush.setVapidDetails(
    "mailto:buzzfinder404@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
);

export async function subscribeUser(sub: webpush.PushSubscription) {
    const session = await auth();
    const userId = session?.user?._id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

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

export async function unsubscribeUser(endpoint: string) {
    const session = await auth();
    const userId = session?.user?._id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    await PushSubscription.deleteOne({
        userId,
        endpoint,
    });

    return { success: true };
}

export async function sendTestNotificationToSelf(message: string) {
    const session = await auth();
    const userId = session?.user?._id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const subscriptions = await PushSubscription.find({ userId });

    if (!subscriptions.length) {
        throw new Error("No subscriptions found");
    }

    const payload = JSON.stringify({
        title: "Test Notification",
        body: message,
        url: "/dashboard",
    });

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

    return {
        success: true,
        results,
    };
}

export async function sendPushToUser({
    recipientId,
    title,
    body,
    url,
    groupId,
    tag,
}: {
    recipientId: string;
    title: string;
    body: string;
    url: string;
    tag?: string;
    groupId: string;
}) {
    // 1. Check if the recipient has notifications enabled for messages
    const recipient = await User.findById(recipientId).select("notificationPreferences");
    
    if (!recipient) return { success: false, error: "User not found" };
    
    const prefs = recipient.notificationPreferences;
    if (!prefs?.pushEnabled || !prefs?.messages) {
        return { success: false, error: "User disabled message notifications" };
    }

    // 2. Fetch all active push subscriptions for this recipient
    const subscriptions = await PushSubscription.find({ userId: recipientId });
    if (!subscriptions.length) return { success: true, message: "No active subscriptions" };

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

export async function sendPushToUsers({
    userIds,
    title,
    body,
    url,
    groupId,
    tag,
}: {
    userIds: string[];
    title: string;
    body: string;
    url: string;
    tag?: string;
    groupId: string;
}) {
    if (!userIds.length) return;

    // 1. Filter target users who have notifications turned on for messages
    const eligibleUsers = await User.find({
        _id: { $in: userIds },
        "notificationPreferences.pushEnabled": true,
        "notificationPreferences.messages": true,
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
