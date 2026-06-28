import Link from "next/link";
import { NOTIFICATION_CONFIG } from "@/lib/notificationConfig";
import { NotificationItemPayload } from "@/model/Notification";
import Image from "next/image";
import {
    LuArchive,
    LuArchiveRestore,
    LuSquareCheck,
    LuSquareDot,
} from "react-icons/lu";
import { useNotifications } from "@/context/NotificationContext";

interface NotificationItemProps {
    notification: NotificationItemPayload;
}

export default function NotificationItem({
    notification,
}: NotificationItemProps) {
    const { toggleArchive, toggleRead } = useNotifications();

    const config = NOTIFICATION_CONFIG[notification.notificationType];
    const displayImg = config.getImage(notification);
    const displayMessage = config.getMessage(
        notification.actor?.name || "Someone",
        notification.resource,
        notification.body,
    );
    const targetLink = config.getLink(notification.resource);

    const timeAgo = new Date(notification.createdAt).toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
        },
    );

    return (
        <div
            className={`border rounded-lg shadow-sm border-foreground/10 p-4 sm:p-5 flex items-start justify-between gap-3 transition-colors group relative ${
                !notification.isRead
                    ? "bg-[#f2b705]/9 hover:bg-[#e0a904]/9 font-semibold"
                    : "bg-background hover:bg-foreground/1"
            }`}
        >
            {/* Dynamic Image */}
            <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden border border-foreground/5 mt-0.5">
                <Image
                    src={displayImg}
                    width={50}
                    height={50}
                    alt={notification.actor?.name || ""}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Notification Information Layout */}
            <Link
                href={targetLink}
                onClick={() => toggleRead(notification._id, true)}
                className="flex-1 min-w-0 pr-2"
            >
                <p className="text-sm leading-normal wrap-break-word">
                    {displayMessage}
                </p>
                <div className="flex text-xs items-center gap-2 mt-1 text-foreground/40">
                    <span className="font-medium text-buzz-gold">
                        {config.label}
                    </span>{" "}
                    &middot; <span>{timeAgo}</span>
                </div>
            </Link>
            <div className="flex gap-3 items-center">

                {/* Quick Context Action Controls */}
                <div className="items-center gap-1.5 flex">
                    {!notification.isArchived && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleRead(
                                    notification._id,
                                    !notification.isRead,
                                );
                            }}
                            className="text-foreground/60 hover:text-buzz-gold"
                            title={
                                notification.isRead
                                    ? "Mark as unread"
                                    : "Mark as read"
                            }
                        >
                            {notification.isRead ? (
                                <LuSquareDot />
                            ) : (
                                <LuSquareCheck />
                            )}
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleArchive(
                                notification._id,
                                !notification.isArchived,
                            );
                        }}
                        className="text-foreground/60 hover:text-buzz-gold"
                        title="Archive item"
                    >
                        {notification.isArchived ? (
                            <LuArchiveRestore />
                        ) : (
                            <LuArchive />
                        )}
                    </button>
                </div>
                {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-buzz-gold" />
                )}
            </div>
        </div>
    );
}
