import Link from "next/link";
import { NOTIFICATION_CONFIG } from "@/lib/notificationConfig";
import { NotificationItemPayload } from "@/model/Notification";
import Image from "next/image";
import { useState, useRef, TouchEvent } from "react";
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

    // Touch tracking state
    const [startX, setStartX] = useState<number | null>(null);
    const [currentX, setCurrentX] = useState<number>(0);
    const [isSwiping, setIsSwiping] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const config = NOTIFICATION_CONFIG[notification.notificationType];
    const displayImg = config.getImage(notification);
    const displayMessage = config.getMessage(
        notification.actor?.name || "Someone",
        notification.resource,
        notification.body,
    );
    const targetLink = config.getLink(notification.resource, notification.body);

    const timeAgo = new Date(notification.createdAt).toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
        },
    );

    // --- Touch Event Handlers ---
    const handleTouchStart = (e: TouchEvent) => {
        // Disable swipe behavior entirely if the item is already archived
        if (notification.isArchived) return;

        setStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (startX === null || notification.isArchived) return;
        const diffX = e.touches[0].clientX - startX;

        // Cap the maximum swipe distance to 80px
        if (Math.abs(diffX) < 80) {
            setCurrentX(diffX);
        } else {
            setCurrentX(diffX > 0 ? 80 : -80);
        }
    };

    const handleTouchEnd = () => {
        if (notification.isArchived) return;

        setIsSwiping(false);
        const swipeThreshold = 65; // Minimum pixels needed to trigger action

        if (currentX < -swipeThreshold) {
            // Swiped Left -> Archive
            toggleArchive(notification._id, true);
        } else if (currentX > swipeThreshold) {
            // Swiped Right -> Toggle Read/Unread
            toggleRead(notification._id, !notification.isRead);
        }

        // Snap back to position
        setCurrentX(0);
        setStartX(null);
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-lg w-full ${
                notification.isArchived ? "" : "select-none touch-pan-y"
            }`}
            // onTouchStart={handleTouchStart}
            // onTouchMove={handleTouchMove}
            // onTouchEnd={handleTouchEnd}
        >
            {/* --- Swipe Background Layers (Only active if not archived) --- */}
            {!notification.isArchived && currentX !== 0 && (
                <div className="absolute inset-0 flex items-center justify-between px-6 rounded-lg pointer-events-none">
                    {/* Swiping Right: Mark Read / Unread Background */}
                    {currentX > 0 && (
                        <div className="absolute inset-0 border rounded-lg border-buzz-blue/20 text-buzz-blue bg-buzz-blue/8 flex items-center justify-start pl-6 gap-2 transition-opacity">
                            {notification.isRead ? (
                                <LuSquareDot className="text-xl" />
                            ) : (
                                <LuSquareCheck className="text-xl" />
                            )}
                        </div>
                    )}

                    {/* Swiping Left: Archive Background */}
                    {currentX < 0 && (
                        <div className="absolute inset-0 border rounded-lg border-buzz-gold/30 text-buzz-gold bg-buzz-gold/10 flex items-center justify-end pr-6 gap-2 transition-opacity">
                            <LuArchive className="text-xl" />
                        </div>
                    )}
                </div>
            )}

            {/* --- Main Card Content Container --- */}
            <div
                style={{
                    transform: `translateX(${currentX}px)`,
                    transition: isSwiping ? "none" : "transform 0.2s ease-out",
                }}
                className={`rounded-lg bg-background z-10 ${!notification.isRead ? "shadow-sm" : ""}`}
                >
            <div
                className={`border rounded-lg p-4 sm:p-5 flex items-start justify-between gap-4 bg-background group relative ${
                    !notification.isRead
                        ? "font-semibold border-buzz-gold/40 bg-buzz-gold/3 hover:bg-buzz-gold/7"
                        : "opacity-90 bg-background hover:bg-buzz-blue/1 border-foreground/10"
                }`}
            >
                {/* Dynamic Image */}
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden border border-foreground/5 mt-0.5">
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
                    <p className="text-foreground/80 text-sm leading-normal wrap-break-word">
                        {displayMessage}
                    </p>
                    <div className="flex text-xs items-center gap-2 mt-1 text-foreground/40">
                        <span className="font-medium text-buzz-gold">
                            {config.label}
                        </span>{" "}
                        &middot; <span>{timeAgo}</span>
                    </div>
                </Link>

                <div className="flex gap-3 items-center self-center">
                    {/* Action Controls Container */}
                    <div className="flex items-center gap-2 text-xl text-buzz-gold">
                        {notification.isArchived ? (
                            /* Always show the Restore button on both mobile and desktop if archived */
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleArchive(notification._id, false);
                                }}
                                className="hover:text-buzz-gold p-1"
                                title="Restore item"
                            >
                                <LuArchiveRestore />
                            </button>
                        ) : (
                            /* Classic quick desktop buttons (hidden on mobile layout since mobile uses swipes) */
                            <div className="flex items-center">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleRead(
                                            notification._id,
                                            !notification.isRead,
                                        );
                                    }}
                                    className="p-1 hover:text-buzz-gold"
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
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleArchive(notification._id, true);
                                    }}
                                    className="p-1 hover:text-buzz-gold"
                                    title="Archive item"
                                >
                                    <LuArchive />
                                </button>
                            </div>
                        )}
                    </div>

                    {!notification.isRead && !notification.isArchived && (
                        <div className="w-2 h-2 rounded-full bg-buzz-gold shrink-0" />
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}
