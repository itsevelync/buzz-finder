"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { NotificationItemPayload } from "@/model/Notification";
import { pusherClient } from "@/lib/pusherClient";
import { useUser } from "./UserContext";
import { usePostAndItem } from "./PostAndItemContext";

interface NotificationContextType {
    notifications: NotificationItemPayload[];
    loading: boolean;
    unreadCount: number;
    toggleRead: (id: string, val: boolean) => Promise<void>;
    toggleArchive: (id: string, val: boolean) => Promise<void>;
    markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const { refresh } = usePostAndItem();
    const [notifications, setNotifications] = useState<
        NotificationItemPayload[]
    >([]);
    const [loading, setLoading] = useState(true);
    const unreadCount = notifications.filter(
        (notification) => !notification.isRead,
    ).length;

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            if (Array.isArray(data)) setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all records once on mount
    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        refresh();
    }, [notifications, refresh]);

    const toggleRead = async (id: string, val: boolean) => {
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: val } : n)),
        );
        await fetch(`/api/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: val }),
        });
    };

    const toggleArchive = async (id: string, val: boolean) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n._id === id ? { ...n, isArchived: val, isRead: true } : n,
            ),
        );
        await fetch(`/api/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isArchived: val, isRead: true }),
        });
    };

    const markAllRead = async () => {
        setNotifications((prev) =>
            prev.map((n) => (!n.isArchived ? { ...n, isRead: true } : n)),
        );
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
        });
    };

    useEffect(() => {
        const notificationChannel = pusherClient.subscribe(`user-${user?._id}`);
        notificationChannel.bind("new-notification", loadNotifications);
        notificationChannel.bind("update-notification", loadNotifications);

        return () => {
            notificationChannel.unbind("new-notification", loadNotifications);
            notificationChannel.unbind(
                "update-notification",
                loadNotifications,
            );
            pusherClient.unsubscribe(`user-${user?._id}`);
        };
    }, [user?._id]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                loading,
                unreadCount,
                toggleRead,
                toggleArchive,
                markAllRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider",
        );
    }
    return context;
}
