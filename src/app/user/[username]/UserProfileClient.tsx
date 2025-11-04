"use client";

import { useState } from "react";
import Image from "next/image";

import type { User } from "@/model/User";
import type { PlainItem } from "@/model/Item";
import { LostItemPost } from "@/model/LostItemPost";

import ContactInfoModal from "@/components/profile/ContactInfoModal";
import LostFoundSelector from "@/components/dashboard/LostFoundSelector";
import ItemList from "@/components/dashboard/ItemList";
import PostList from "@/components/dashboard/PostList";

import { MdContactMail } from "react-icons/md";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lostItemsSelected, setLostItemsSelected] = useState(false);
    if (!userProfile) {
        return <p>User not found.</p>;
    }
    return (
        <div className="p-8 max-w-6xl flex flex-col items-center m-auto">
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-20 mb-6 w-full">
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
                                {lostItemPosts.length}
                            </h2>
                            <p>Lost Items</p>
                        </div>
                        <div className="border-l border-l-buzz-blue opacity-50 my-1"></div>
                        <div className="flex flex-col items-center">
                            <h2 className="font-bold text-2xl text-buzz-blue">
                                {foundItems.length}
                            </h2>
                            <p>Found Items</p>
                        </div>
                    </div>
                </div>
                {userProfile?.description && <p>{userProfile.description}</p>}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="font-medium mt-3 border text-buzz-blue border-buzz-blue/30 rounded flex gap-2 items-center px-3 py-1"
                >
                    <MdContactMail /> Contact Info
                </button>
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
                />
            )}
        </div>
    );
}
