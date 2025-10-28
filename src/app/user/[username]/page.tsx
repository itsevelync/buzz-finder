import { auth } from "@/auth";
import { getUserByUsername } from "@/actions/User";
import UserProfileClient from "./UserProfileClient";
import type { User } from "@/model/User";
import type { Item } from "@/model/Item";
import { LostItemPost } from "@/model/LostItemPost";

interface ProfilePageProps {
    params: {
        username: string;
    };
}

export default async function Profile({ params }: ProfilePageProps) {
    const session = await auth();

    let userProfile: User | null = null;
    try {
        params = await params;
        userProfile = await getUserByUsername(params.username);
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }

    let foundItems: Item[] = [];
    let lostItemPosts: LostItemPost[] = [];
    if (userProfile?._id) {
        try {
            const foundResponse = await fetch(
                `${process.env.NEXTAUTH_URL}/api/item?person_found=${userProfile._id}`
            );
            const lostResponse = await fetch(
                `${process.env.NEXTAUTH_URL}/api/lost-item-post?user=${userProfile._id}`
            );
            if (foundResponse.ok) {
                foundItems = await foundResponse.json();
            } else {
                console.error(
                    "Error fetching found items:",
                    foundResponse.statusText
                );
            }
            if (lostResponse.ok) {
                lostItemPosts = await lostResponse.json();
            } else {
                console.error(
                    "Error fetching lost items:",
                    lostResponse.statusText
                );
            }
        } catch (error) {
            console.error("Error fetching found items:", error);
        }
    }

    return (
        <UserProfileClient
            userProfile={userProfile}
            sessionUserId={session?.user?._id}
            foundItems={foundItems}
            lostItemPosts={lostItemPosts}
        />
    );
}
