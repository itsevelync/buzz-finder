"use client";

import Link from "next/link";
import { categories } from "@/constants/Categories";
import Image from "next/image";
import { FaChevronLeft } from "react-icons/fa";
import EditDeleteBtns from "@/components/dashboard/EditDeleteBtns";
import CenteredMap from "@/components/maps/CenteredMap";
import {
    LuBox,
    LuCheck,
    LuImageOff,
    LuMapPin,
} from "react-icons/lu";
import ResolveItemModal from "@/components/post/ResolveItemModal";
import { Session } from "next-auth";
import UserInfo from "@/components/item-page/UserInfo";
import { ItemNoteTree } from "@/model/ItemNote";
import ItemPosterContactInfo from "@/components/item-page/ItemPosterContactInfo";
import SubmitItemNote from "@/components/item-page/SubmitItemNote";
import ItemNotes from "@/components/item-page/ItemNotes";
import { useEffect, useState } from "react";
import { useModal } from "@/context/ModalContext";
import { usePostAndItem } from "@/context/PostAndItemContext";
import Loading from "@/app/loading";
import SharePostButton from "@/components/item-page/SharePostButton";
import MatchItem from "@/components/item-page/MatchItem";
import StatusBanner from "@/components/item-page/StatusBanner";

interface LostItemClientProps {
    id: string;
    session: Session | null;
}

export default function LostItemClient({ id, session }: LostItemClientProps) {
    const [itemNotes, setItemNotes] = useState<ItemNoteTree[]>([]);
    const { openModal } = useModal();
    const { lostItemPosts } = usePostAndItem();

    const lost_item = lostItemPosts.find((i) => i._id.toString() === id);

    async function getItemNotes(itemId: string) {
        try {
            const res = await fetch(`/api/item-notes/?itemId=${itemId}`);

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
        getItemNotes(id.toString());
    }, [id]);

    function openResolveItemModal() {
        openModal(
            <ResolveItemModal
                itemId={String(id)}
                itemName={lost_item?.name ?? "this item"}
            />,
        );
    }

    if (!lostItemPosts.length) {
        return <Loading />;
    }

    if (!lost_item) {
        return (
            <div className="p-8 text-center max-w-xl m-auto h-full justify-center flex flex-col">
                <h2 className="text-2xl font-semibold text-foreground">
                    Item Not Found
                </h2>
                <p className="text-foreground/80 mt-2">
                    The item post you are looking for may have been deleted or
                    resolved.
                </p>
                <Link
                    href="/dashboard?tab=lost"
                    className="mt-4 inline-block text-buzz-blue hover:underline"
                >
                    Return to dashboard
                </Link>
            </div>
        );
    }

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
        timeZone: "UTC",
    });

    const isOwner =
        session?.user?._id && session?.user?._id === lost_item.user?._id;

    return (
        <div className="p-4 pb-8 sm:p-8 max-w-6xl m-auto flex flex-col gap-6">
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
            {lost_item.isFound && <StatusBanner text="This item is marked as found!" />}

            {/* Core Title and Badges */}
            <div className="text-center sm:text-left w-full">
                <h1 className="text-3xl font-bold">
                    {lost_item.name ?? "Untitled Missing Item"}
                </h1>
                <p className="text-gray-500 mb-2">{`Posted on ${formattedCreatedDate}`}</p>

                <div className="flex flex-col items-center sm:flex-row gap-3 w-full">
                    <div className="flex flex-col sm:flex-row gap-3 items-center my-1">
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
                    </div>
                    <SharePostButton />
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Main content split into 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-4 w-full">
                    {isOwner && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-3">
                            <h3 className="text-lg font-bold">
                                Item Owner Actions
                            </h3>
                            {lost_item.isFound ? (
                                <div className="w-full text-foreground/80 font-medium py-2.5 rounded-md border border-dashed border-foreground/30 flex items-center justify-center gap-2">
                                    <LuCheck /> Marked as Found!
                                </div>
                            ) : (
                                <button
                                    onClick={openResolveItemModal}
                                    className="w-full bg-buzz-blue hover:opacity-90 text-white font-semibold py-2.5 rounded-md transition text-sm flex items-center justify-center gap-2"
                                >
                                    <LuCheck /> Mark as Found
                                </button>
                            )}
                            {!lost_item.isFound && (
                                <div className="flex justify-center mt-1">
                                    <EditDeleteBtns
                                        editURL={`/lost-item/${lost_item._id}/edit`}
                                        deleteAPIRoute={`/api/lost-item-posts/${lost_item._id}`}
                                        redirect="/dashboard?tab=lost"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {/* Item image */}
                    <div className="w-full h-30 sm:h-50 bg-foreground/2 rounded-lg overflow-hidden relative border border-foreground/10">
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
                    <ItemPosterContactInfo
                        userId={session?.user?._id}
                        itemPoster={lost_item.user}
                        itemContactInfo={lost_item.contactInfo}
                    />

                    <MatchItem
                        currentItemId={id}
                        mode="found"
                        resolved={lost_item.isFound}
                    />

                    {/* Desktop submit item note */}
                    {!lost_item.isFound && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-white hidden sm:flex flex-col gap-5">
                            <SubmitItemNote
                                itemId={lost_item._id.toString()}
                                getItemNotes={getItemNotes}
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
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-dashed border-gray-200 rounded-lg p-4">
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
                        <p className="text-gray-600">
                            Last seen near:{" "}
                            <span className="font-medium text-foreground">
                                {lost_item.locationDescription ||
                                    "Unknown Location"}
                            </span>
                        </p>

                        {/* Map Container */}
                        {lost_item.locationPin && (
                            <div className="mt-3 h-90 w-full rounded-lg overflow-hidden border border-foreground/10 flex justify-center items-center bg-foreground/2 text-foreground/70">
                                <CenteredMap
                                    width="100%"
                                    height="100%"
                                    pin={lost_item}
                                    disableClick={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* Mobile submit item note */}
                    {!lost_item.isFound && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-white flex sm:hidden flex-col gap-5">
                            <SubmitItemNote
                                itemId={lost_item._id.toString()}
                                getItemNotes={getItemNotes}
                            />
                        </div>
                    )}

                    {/* Item Notes */}
                    <ItemNotes
                        itemNotes={itemNotes}
                        setItemNotes={setItemNotes}
                    />
                </div>
            </div>
        </div>
    );
}
