"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { User } from "@/model/User";
import type { PlainItem } from "@/model/Item";
import { LostItemPost } from "@/model/LostItemPost";

import ContactInfoModal from "@/components/profile/ContactInfoModal";
import LostFoundSelector from "@/components/dashboard/LostFoundSelector";
import ItemList from "@/components/dashboard/ItemList";
import PostList from "@/components/dashboard/PostList";

import { useUser } from "../../../context/UserContext";
import Link from "next/link";
import { LuIdCard, LuMessagesSquare, LuPencil } from "react-icons/lu";

interface UserProfileClientProps {
    userProfile: User | null;
    foundItems: PlainItem[];
    lostItemPosts: LostItemPost[];
}

export default function UserProfileClient({
    userProfile,
    foundItems,
    lostItemPosts,
}: UserProfileClientProps) {
    const { user: activeUser } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lostItemsSelected, setLostItemsSelected] = useState(false);
    const myProfile = activeUser?._id === userProfile?._id;
    const [chatURL, setChatURL] = useState("/chat");

    useEffect(() => {
        async function loadChatId() {
            const response = await fetch(
                `/api/conversations?partnerId=${userProfile?._id}`,
            );
            const data = await response.json();

            const chatId = data.conversationId;
            if (chatId) {
                setChatURL("/chat?id=" + chatId);
            } else {
                setChatURL("/chat?id=pending-" + userProfile?._id);
            }
        }
        loadChatId();
    }, [userProfile]);

    if (!userProfile) {
        return <p>User not found.</p>;
    }

    return (
        <div className="px-2 py-6 sm:px-8 sm:py-8 max-w-6xl flex flex-col items-center m-auto">
            <div className="w-full max-w-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-20 mt-4 mb-6 w-full">
                    <div className="flex items-center gap-6">
                        <Image
                            src={userProfile?.image || "/default-icon.svg"}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold">
                                {userProfile?.name}
                            </h2>
                            <p className="text-gray-600">
                                @{userProfile?.username}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 grow px-4 justify-around">
                        <div className="flex flex-col items-center">
                            <h2 className="font-bold text-2xl text-buzz-blue">
                                {foundItems.length}
                            </h2>
                            <p>Found Items</p>
                        </div>
                        <div className="border-l border-l-buzz-blue opacity-50 my-1"></div>
                        <div className="flex flex-col items-center">
                            <h2 className="font-bold text-2xl text-buzz-blue">
                                {lostItemPosts.length}
                            </h2>
                            <p>Lost Items</p>
                        </div>
                    </div>
                </div>
                {userProfile?.description && (
                    <p className="mb-4">{userProfile.description}</p>
                )}
                <div className="w-full justify-center flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full justify-center font-medium mt-3 border text-buzz-blue border-buzz-blue/40 rounded-md flex gap-3 items-center px-4 py-2 hover:bg-buzz-blue/5"
                    >
                        <LuIdCard size={20} /> Contact Info
                    </button>
                    {myProfile ? (
                        <Link
                            href="/settings?tab=profile"
                            className="w-full justify-center mt-3 border text-background border-buzz-blue/30 bg-buzz-blue rounded-md flex gap-3 items-center px-4 py-2 hover:opacity-90 transition"
                        >
                            <LuPencil /> Edit Profile
                        </Link>
                    ) : (
                        <Link
                            href={chatURL}
                            className="w-full justify-center mt-3 border text-background border-buzz-blue/30 bg-buzz-blue rounded-md flex gap-3 items-center px-4 py-2"
                        >
                            <LuMessagesSquare /> Message
                        </Link>
                    )}
                </div>
            </div>
            <LostFoundSelector
                lostItemsSelected={lostItemsSelected}
                setLostItemsSelected={setLostItemsSelected}
            />

            <div>
                {lostItemsSelected ? (
                    <PostList lostItemPosts={lostItemPosts} columns={4} />
                ) : (
                    <ItemList items={foundItems} />
                )}
            </div>

            {userProfile && isModalOpen && (
                <ContactInfoModal
                    onClose={() => setIsModalOpen(false)}
                    email={userProfile.email}
                    phone={userProfile.phoneNum}
                    discord={userProfile.discord}
                    instagram={userProfile.instagram}
                />
            )}
        </div>
    );
}
