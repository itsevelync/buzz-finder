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
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserContextUser | null>(null);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user?._id) {
            setUser(null);
            return;
        }

        const controller = new AbortController();

        const fetchUser = async (userId: string) => {
            try {
                const res = await fetch(`/api/users/${userId}`, {
                    signal: controller.signal,
                });
                if (res.ok) {
                    const data = await res.json();

                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }
                console.error("Failed to fetch user:", error);
                setUser(null);
            }
        };

        fetchUser(session.user._id);

        return () => {
            controller.abort();
        };
    }, [session?.user?._id, status]);

    const value = useMemo(() => ({ user, setUser }), [user]);

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
