import mongoose, { InferSchemaType, ObjectId, Schema } from "mongoose";

const NOTIFICATION_TYPES = [
    "ITEM_MATCH",
    "ITEM_UPDATE",
    "NEW_COMMENT",
    "SEARCH_ALERT",
    "SYSTEM_ALERT",
] as const;

const NotificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        actor: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        resource: {
            type: Schema.Types.ObjectId,
            refPath: "resourceType",
        },
        resourceType: {
            type: String,
            enum: ["Item", "Message", "LostItemPost", "ItemNote"],
        },
        notificationType: {
            type: String,
            required: true,
            enum: NOTIFICATION_TYPES,
        },
        body: {
            type: String,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

NotificationSchema.index({ recipient: 1, isArchived: 1, createdAt: -1 });

export type Notification = InferSchemaType<typeof NotificationSchema> & {
    _id: ObjectId;
};

export type PlainNotification = Omit<
    Notification,
    "_id" | "recipient" | "actor" | "resource"
> & {
    _id: string;
    recipient: string;
    actor: string;
    resource: string;
};

export default mongoose.models?.Notification ??
    mongoose.model("Notification", NotificationSchema);

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationResource = {
    _id: string;
    name?: string;
    image?: { id: string; url: string };
    text?: string;
    note?: string;
    itemId?: string;
    deletedAt?: string;
    itemType?: string;
};

export type NotificationItemPayload = {
    _id: string;
    actor: { name: string; image?: string };
    notificationType: NotificationType;
    resource: NotificationResource;
    body: string;
    isRead: boolean;
    isArchived: boolean;
    createdAt: string;
};
