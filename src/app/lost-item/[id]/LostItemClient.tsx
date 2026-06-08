"use client";

import { LostItemPost } from "@/model/LostItemPost";
import Link from "next/link";
import { categories } from "@/constants/Categories";
import Image from "next/image";
import { FaChevronLeft } from "react-icons/fa";
import EditDeleteBtns from "@/components/dashboard/EditDeleteBtns";
import CenteredMap from "@/components/maps/CenteredMap";
import { LuBadgeCheck, LuBox, LuImageOff, LuMapPin } from "react-icons/lu";
import SharePostButton from "@/components/post/ShareButton";
import ResolveItemModalWrapper from "@/components/post/ResolveItemModal";
import { Session } from "next-auth";
import UserInfo from "@/components/post/UserInfo";
import { ItemNote } from "@/model/ItemNote";
import PostOwnerContactInfo from "@/components/post/PostOwnerContactInfo";
import SubmitItemNote from "@/components/post/SubmitItemNote";
import ItemNotes from "@/components/post/ItemNotes";
import { useEffect, useState } from "react";

interface LostItemClientProps {
    lost_item: LostItemPost;
    session: Session | null;
}

export default function LostItemClient({
    lost_item,
    session,
}: LostItemClientProps) {
    const [itemNotes, setItemNotes] = useState<ItemNote[]>([]);

    const category = categories[lost_item.category] || {
        label: "Unknown",
        color: "#6B7280",
    };

    const displayDate = lost_item.lostDate
        ? new Date(lost_item.lostDate)
        : new Date(lost_item.createdAt);

    const formattedCreatedDate = new Date(
        lost_item.createdAt,
    ).toLocaleDateString(undefined, {
        dateStyle: "long",
    });

    const formattedLostDate = displayDate.toLocaleDateString(undefined, {
        dateStyle: "long",
    });

    const isOwner =
        session?.user?._id && session?.user?._id === lost_item.user?._id;

        async function getItemNotes(itemId: string) {
            try {
                const res = await fetch(`/api/item-note/?itemId=${itemId}`);

                if (!res.ok) {
                    console.error(
                        `Failed to fetch item notes: ${res.status} ${res.statusText}`,
                    );
                }

                const data = await res.json();
                setItemNotes(data);
            } catch (error) {
                console.error("Error fetching item:", error);
            }
        }

    useEffect(() => {
        getItemNotes(lost_item._id.toString());
    }, [lost_item._id]);

    return (
        <div className="p-4 sm:p-8 max-w-6xl m-auto flex flex-col gap-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard?tab=lost"
                    className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all w-fit"
                >
                    <FaChevronLeft className="text-xs" /> Back to Dashboard
                </Link>
            </div>

            {/* Found Status Banner Announcement */}
            {lost_item.isFound && (
                <div className="items-center w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-2 flex gap-3 shadow-xs animate-in slide-in-from-top-2 duration-200">
                    <LuBadgeCheck className="text-lg text-emerald-600" />
                    <h3 className="font-medium text-emerald-950 text-base leading-tight">
                        This item has been successfully recovered!
                    </h3>
                </div>
            )}

            {/* Core Title and Badges */}
            <div className="text-center sm:text-left w-full">
                <h1 className="text-3xl font-bold">
                    {lost_item.name ?? "Untitled Missing Item"}
                </h1>
                <p className="text-gray-500 mb-2">{`Posted on ${formattedCreatedDate}`}</p>

                <div className="flex gap-3 w-full">
                    <p
                        style={{
                            color: category.color,
                            backgroundColor: category.color + "20",
                        }}
                        className="w-fit rounded-full px-4 py-1 text-sm font-medium flex items-center"
                    >
                        {category.label ?? "N/A"}
                    </p>
                    <UserInfo user={lost_item.user} />
                    <div className="ml-auto">
                        <SharePostButton />
                    </div>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Main content split into 2 Columns */}
            <div className="z-500 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* LEFT COLUMN */}
                <div className="lg:sticky lg:top-6 z-10 flex flex-col gap-4 w-full">
                    {/* Item image */}
                    <div className="w-full h-30 sm:h-50 bg-foreground/2 rounded-lg overflow-hidden relative border border-foreground/10 shadow">
                        {lost_item.image?.url ? (
                            <Image
                                src={lost_item.image.url}
                                alt={lost_item.name ?? "Lost Item"}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-foreground/60 gap-2 p-6 text-center">
                                <div className="text-5xl">
                                    <LuImageOff />
                                </div>
                                <p className="text-foreground/70">
                                    No image uploaded
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Owner contact information */}
                    <PostOwnerContactInfo
                        lost_item={lost_item}
                        session={session}
                    />

                    <div className="z-50 border border-gray-200 rounded-lg p-4 shadow-md bg-white flex flex-col gap-5">
                        {/* Context Actions Block */}
                        {isOwner && !lost_item.isFound && (
                            <ResolveItemModalWrapper
                                itemId={String(lost_item._id)}
                                itemName={lost_item.name ?? "this item"}
                            />
                        )}

                        {!isOwner && !lost_item.isFound && (
                            <SubmitItemNote lost_item={lost_item} getItemNotes={getItemNotes} />
                        )}
                    </div>

                    {/* Edit/delete buttons for poster */}
                    {isOwner && (
                        <div className="border-t border-gray-100 flex justify-center">
                            <EditDeleteBtns
                                editURL={`/lost-item-post/${lost_item._id}/edit`}
                                deleteAPIRoute={`/api/lost-item-post/${lost_item._id}`}
                                redirect="/dashboard?tab=lost"
                            />
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Item Description */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-1.5">
                            <LuBox className="text-buzz-gold" /> Item
                            Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-dashed border-gray-200 rounded-lg p-4 shadow-sm">
                            {lost_item.description ||
                                "The owner did not provide an extended description for this item."}
                        </p>
                    </div>

                    {/* Last Seen Approximate Location & Map */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-1.5">
                            <LuMapPin className="text-buzz-gold" /> Last Seen
                            Details
                        </h3>
                        <p className="text-gray-600">
                            Date lost:{" "}
                            <span className="font-medium text-foreground">
                                {formattedLostDate}
                            </span>
                        </p>
                        <p className="text-gray-600 mb-3">
                            Last seen near:{" "}
                            <span className="font-medium text-foreground">
                                {lost_item.locationDescription ||
                                    "Unknown Location"}
                            </span>
                        </p>

                        {/* Map Container */}
                        <div className="h-90 w-full rounded-lg overflow-hidden border border-foreground/10 flex justify-center items-center bg-foreground/2 text-foreground/70 shadow">
                            {lost_item.locationPin ? (
                                <CenteredMap
                                    width="100%"
                                    height="100%"
                                    pin={lost_item}
                                    disableClick={true}
                                />
                            ) : (
                                <div>No map location selected.</div>
                            )}
                        </div>
                    </div>

                    {/* Item Notes */}
                    <ItemNotes itemNotes={itemNotes} />
                </div>
            </div>
        </div>
    );
}
