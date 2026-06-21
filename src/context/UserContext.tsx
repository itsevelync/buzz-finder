"use client";

import { useSession } from "next-auth/react";
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import type { User } from "@/model/User";

type UserContextUser = Pick<
    User,
    "_id" | "name" | "username" | "email" | "image"
> &
    Partial<
        Pick<
            User,
            | "phoneNum"
            | "description"
            | "discord"
            | "instagram"
            | "linkedIn"
            | "hideEmail"
            | "hasPassword"
            | "notificationPreferences"
        >
    >;

interface UserContextValue {
    user: UserContextUser | null;
    setUser: Dispatch<SetStateAction<UserContextUser | null>>;
    refreshUser: () => Promise<void>; // Added refresh function to types
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserContextUser | null>(null);

    // Isolated fetch logic wrapped in useCallback so it can be invoked manually or inside effects
    const fetchUser = useCallback(
        async (userId: string, signal?: AbortSignal) => {
            try {
                const res = await fetch(`/api/users/${userId}`, { signal });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                if (signal?.aborted) return;
                console.error("Failed to fetch user:", error);
                setUser(null);
            }
        },
        [],
    );

    // Expose a public refresh handler that components can call imperatively
    const refreshUser = useCallback(async () => {
        if (status !== "authenticated" || !session?.user?._id) {
            setUser(null);
            return;
        }
        await fetchUser(session.user._id);
    }, [session?.user?._id, status, fetchUser]);

    // Handle initial load and session changes
    useEffect(() => {
        if (status !== "authenticated" || !session?.user?._id) {
            setUser(null);
            return;
        }

        const controller = new AbortController();
        fetchUser(session.user._id, controller.signal);

        return () => {
            controller.abort();
        };
    }, [session?.user?._id, status, fetchUser]);

    // Added refreshUser to the memoized value array dependencies
    const value = useMemo(
        () => ({ user, setUser, refreshUser }),
        [user, refreshUser],
    );

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }

    return context;
}

export type { UserContextUser };
