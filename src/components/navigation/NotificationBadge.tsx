"use client";

import { useNotifications } from "@/context/NotificationContext";
import NavItem from "./NavItem";
import { IoNotifications, IoNotificationsOutline } from "react-icons/io5";

interface NotificationBadgeProps {
    size?: string;
    direction?: "right" | "bottom" | "top" | "left";
}

export default function NotificationBadge({
    size,
    direction,
}: NotificationBadgeProps) {
    const { unreadCount } = useNotifications();

    return (
        <div className="relative">
            <NavItem
                name="Notifications"
                href="/notifications"
                icon={IoNotificationsOutline}
                iconFill={IoNotifications}
                direction={direction}
                size={size}
            />
            {unreadCount > 0 && (
                <div
                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                                     min-w-4 h-4 px-1 text-[10px] font-bold text-white
                                     bg-buzz-gold rounded-full"
                >
                    {unreadCount > 99 ? "99+" : unreadCount}
                </div>
            )}
        </div>
    );
}
