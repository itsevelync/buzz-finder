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

type UserContextUser = Pick<User, "_id" | "name" | "username" | "image"> &
    Partial<Pick<User, "phoneNum" | "description" | "discord" | "instagram">>;

interface UserContextValue {
    user: UserContextUser | null;
    setUser: Dispatch<SetStateAction<UserContextUser | null>>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [user, setUser] = useState<UserContextUser | null>(null);

    useEffect(() => {
        const sessionUser = session?.user;

        if (!sessionUser?._id) {
            setUser(null);
            return;
        }

        setUser((currentUser) => ({
            _id: sessionUser._id,
            name: sessionUser.name ?? currentUser?.name ?? "",
            username: sessionUser.username ?? currentUser?.username ?? "",
            image: sessionUser.image ?? currentUser?.image ?? null,
            phoneNum: currentUser?.phoneNum,
            description: currentUser?.description,
            discord: currentUser?.discord,
            instagram: currentUser?.instagram,
        }));
    }, [session]);

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
