import { getUserByUsername } from "@/actions/User";
import UserProfileClient from "./UserProfileClient";
import type { User } from "@/model/User";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Profile",
};

interface ProfilePageProps {
    params: {
        username: string;
    };
}

export default async function Profile({ params }: ProfilePageProps) {
    params = await params;

    let userProfile: User | null = null;
    try {
        userProfile = await getUserByUsername(params.username);
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }

    if (!userProfile) {
        return <p>User not found.</p>;
    }

    return <UserProfileClient userProfile={userProfile} />;
}
