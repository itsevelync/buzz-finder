import { ItemStatus, statuses } from "@/constants/Statuses";
import {
    NotificationItemPayload,
    NotificationResource,
    NotificationType,
} from "@/model/Notification";
import React from "react";
import { ReactNode } from "react";

interface ConfigItem {
    label: string;
    type: string;
    getImage: (notification: NotificationItemPayload) => string;
    getLink: (resource?: NotificationResource) => string;
    getMessage: (
        actorName: string,
        resource?: NotificationResource,
        detail?: string,
    ) => ReactNode;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, ConfigItem> = {
    ITEM_MATCH: {
        label: "Match Found",
        type: "itemMatches",
        getImage: (n) => n.resource?.image?.url ?? "/img-placeholder.jpg",
        getLink: (r) => `/item/${r?._id ?? "deleted-item"}`,
        getMessage: (_, resource, detail) =>
            <>Your item &ldquo;{detail}&rdquo; has a potential match:  <span className="font-bold">{resource?.name}</span>.</>,
    },
    ITEM_UPDATE: {
        label: "Status Update",
        type: "itemStatusUpdates",
        getImage: (n) => n.resource?.image?.url ?? "/img-placeholder.jpg",
        getLink: (r) => `/item/${r?._id ?? "deleted-item"}`,
        getMessage: (_, __, detail) => (
            <>
                Your found item&rsquo;s status was changed to:{" "}
                <span className="font-bold">
                    {statuses[detail as ItemStatus].label}
                </span>
                .
            </>
        ),
    },
    NEW_COMMENT: {
        label: "New Comment",
        type: "newItemNotes",
        getImage: (n) =>
            n.resource.deletedAt || !n.actor?.image
                ? "/default-icon.svg"
                : n.actor.image,
        getLink: (r) => `/lost-item/${r?.itemId ?? "deleted-item"}`,
        getMessage: (actor, resource) =>
            !resource?.deletedAt ? (
                `${actor} left a note on your item: ${resource?.note}`
            ) : (
                <>
                    Someone left a note on your item:{" "}
                    <i className="opacity-60">This note was deleted</i>.
                </>
            ),
    },
    SEARCH_ALERT: {
        label: "Search Alert",
        type: "searchAlert",
        getImage: (n) => n.resource?.image?.url ?? "/img-placeholder.jpg",
        getLink: (r) => `/item/${r?._id ?? "deleted-item"}`,
        getMessage: (_, __, detail) => (
            <>
                An item was posted matching your saved search
                {detail ? (
                    <>
                        : <span className="font-bold">{detail}</span>
                    </>
                ) : (
                    <>.</>
                )}
            </>
        ),
    },
    SYSTEM_ALERT: {
        label: "System Alert",
        type: "systemAlert",
        getImage: () => "/buzzfinder-logo.png",
        getLink: () => "/",
        getMessage: (_, __, detail) => detail || "System update notice.",
    },
};

export function getTextFromNode(node: React.ReactNode): string {
    if (
        typeof node === "string" ||
        typeof node === "number" ||
        typeof node === "bigint"
    ) {
        return String(node);
    }

    if (node == null || typeof node === "boolean") {
        return "";
    }

    if (Array.isArray(node)) {
        return node.map(getTextFromNode).join("");
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return getTextFromNode(node.props.children);
    }

    return "";
}
