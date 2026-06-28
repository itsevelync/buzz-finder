"use client";

import { useState, useMemo } from "react";
import NotificationItem from "@/components/notifications/NotificationItem";
import { LuCheckCheck } from "react-icons/lu";
import { useNotifications } from "@/context/NotificationContext";

type FilterType = "inbox" | "unread" | "archive";

export default function NotificationsPage() {
    const { notifications, markAllRead, loading } = useNotifications();

    const [filter, setFilter] = useState<FilterType>("inbox");

    // Client-side filtering
    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            if (filter === "unread") return !n.isRead && !n.isArchived;
            if (filter === "archive") return n.isArchived;
            return !n.isArchived; // 'inbox' excludes archived items
        });
    }, [notifications, filter]);

    const hasUnreadInCurrentView = filteredNotifications.some((n) => !n.isRead);

    return (
        <div className="mx-auto max-w-5xl w-full h-full flex flex-col">
            {/* Minimal Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between px-5 sm:px-6 pt-6 sm:pt-8 pb-2 sm:pb-3">
                <h1 className="text-3xl font-semibold text-buzz-blue">
                    Notifications
                </h1>
                {hasUnreadInCurrentView && (
                    <button
                        onClick={markAllRead}
                        className="border border-buzz-gold/30 rounded px-3 py-1 bg-buzz-gold/2 hover:bg-buzz-gold/5 text-sm font-medium text-buzz-gold hover:opacity-80"
                    >
                        Mark all as read{" "}
                        <LuCheckCheck className="ml-1 inline-flex align-middle" />
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-foreground/10 px-2 sm:px-4 gap-4 sm:gap-6">
                {(["inbox", "unread", "archive"] as FilterType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-3 capitalize font-medium border-b-2 transition-all relative ${
                            filter === tab
                                ? "border-buzz-blue text-buzz-blue"
                                : "border-transparent text-foreground/40 hover:text-foreground/70"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Notification Container Stream */}
            <div className="flex-1 overflow-y-auto space-y-2 py-5 px-4">
                {loading ? (
                    <div className="text-center py-12 text-sm text-foreground/40">
                        Loading notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <p className="text-sm text-foreground/40">
                            No notifications found.
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
