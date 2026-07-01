"use client";

import Image from "next/image";
import { FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import CenteredMap from "@/components/maps/CenteredMap";
import { categories } from "@/constants/Categories";
import EditDeleteBtns from "@/components/dashboard/EditDeleteBtns";
import ItemStatusActions from "@/components/report-item/ItemStatusActions";
import { usePostAndItem } from "@/context/PostAndItemContext";
import { useUser } from "@/context/UserContext";
import Loading from "@/app/loading";
import {
    LuBox,
    LuImageOff,
    LuMapPin,
    LuInfo,
    LuTriangleAlert,
    LuArchive,
} from "react-icons/lu";
import SubmitItemNote from "@/components/item-page/SubmitItemNote";
import { useEffect, useState } from "react";
import { ItemNoteTree } from "@/model/ItemNote";
import ItemNotes from "@/components/item-page/ItemNotes";
import ItemPosterContactInfo from "@/components/item-page/ItemPosterContactInfo";
import UserInfo from "@/components/item-page/UserInfo";
import SharePostButton from "@/components/item-page/SharePostButton";
import MatchItem from "@/components/item-page/MatchItem";
import StatusBanner from "@/components/item-page/StatusBanner";
import ItemTypeBadge from "@/components/item-page/ItemTypeBadge";

interface ItemClientProps {
    id: string;
    initialNotes: ItemNoteTree[];
}

export default function ItemClient({ id, initialNotes }: ItemClientProps) {
    const { user } = useUser();
    const { items } = usePostAndItem();
    const [itemNotes, setItemNotes] = useState<ItemNoteTree[]>(initialNotes);

    useEffect(() => {
        setItemNotes(initialNotes);
    }, [initialNotes]);

    if (!items.length) {
        return <Loading />;
    }

    const item = items.find((i) => i._id.toString() === id);

    if (!item) {
        return (
            <div className="p-8 text-center max-w-xl m-auto h-full justify-center flex flex-col">
                <h2 className="text-2xl font-semibold text-foreground">
                    Item Not Found
                </h2>
                <p className="text-foreground/80 mt-2">
                    The found item you are looking for may have been deleted.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-4 inline-block text-buzz-blue hover:underline"
                >
                    Return to dashboard
                </Link>
            </div>
        );
    }

    const isOwner = user?._id && user._id === item.personFound?._id;
    const category = categories[item.category] || {
        label: "Unknown",
        color: "#6B7280",
    };

    const formattedLostDate = new Date(item.lostDate).toLocaleDateString(
        undefined,
        {
            dateStyle: "long",
        },
    );
    const formattedLostTime = new Date(item.lostDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="p-4 pb-8 sm:p-8 max-w-6xl m-auto flex flex-col gap-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all w-fit"
                >
                    <FaChevronLeft className="text-xs" /> Back to Dashboard
                </Link>
            </div>

            {/* Status Banner Announcement */}
            {item.status === "claimed" && (
                <StatusBanner text="This item is marked as claimed!" />
            )}
            {item.status === "gone" && (
                <StatusBanner
                    color="amber"
                    icon={LuTriangleAlert}
                    text="This item is marked as no longer there."
                />
            )}
            {item.status === "archived" && (
                <StatusBanner
                    color="gray"
                    icon={LuArchive}
                    text="This item was found over three weeks ago and has been archived."
                />
            )}

            {/* Core Title and Badges */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end w-full gap-4">
                <div className="text-center sm:text-left">
                    <ItemTypeBadge type="found" />
                    <h1 className="mt-4 text-3xl font-bold">
                        {item.name ?? "Untitled Found Item"}
                    </h1>
                    <p className="text-gray-500 mb-2">{`Found on ${formattedLostDate} at ${formattedLostTime}`}</p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
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
                            {item.personFound && (
                                <UserInfo
                                    user={item.personFound}
                                    text="Found by"
                                />
                            )}
                        </div>
                    </div>
                </div>{" "}
                <div className="flex flex-col gap-4 items-center sm:items-end mt-1">
                    {isOwner && (
                        <EditDeleteBtns
                            editURL={`/item/${item._id}/edit`}
                            deleteAPIRoute={`/api/items/${item._id}`}
                        />
                    )}
                    <SharePostButton />
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Main content split into 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-4 w-full">
                    {/* Item Image Card */}
                    {item.image?.url ? (
                        <Image
                            src={item.image.url}
                            alt={item.name ?? "Found Item"}
                            width={250}
                            height={250}
                            className="mx-auto w-4/5 max-w-80 rounded-lg border border-foreground/10"
                            priority
                        />
                    ) : (
                        <div className="w-full h-40 sm:h-50 bg-foreground/2 rounded-lg overflow-hidden relative border border-foreground/10">
                            <div className="w-full h-full flex flex-col items-center justify-center text-foreground/60 gap-2 p-6 text-center">
                                <div className="text-5xl">
                                    <LuImageOff />
                                </div>
                                <p className="text-foreground/70">
                                    No image uploaded
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Item Finder / Owner Actions Card */}

                    <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-3">
                        <ItemStatusActions
                            itemId={item._id.toString()}
                            currentStatus={item.status}
                            lostDate={item.lostDate}
                        />
                    </div>

                    {/* Contact Information Card */}
                    <ItemPosterContactInfo
                        userId={user?._id}
                        itemPoster={item.personFound}
                        itemContactInfo={item.contactInfo}
                        title="Contact Item Finder"
                    />

                    <MatchItem
                        currentItemId={id}
                        mode="lost"
                        resolved={item.status !== "unclaimed"}
                    />

                    {/* Desktop submit item note */}
                    {item.status === "unclaimed" && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-white hidden sm:flex flex-col gap-5">
                            <SubmitItemNote
                                itemId={item._id}
                                title="Submit an Item Note"
                                subtitle="Leave notes about this item below."
                                placeholder="Example: I left the item with campus security. It is at the library lost and found now."
                                itemType="Item"
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
                            {item.description ||
                                "The finder did not provide an extended description for this item."}
                        </p>
                    </div>

                    {/* Retrieval Information */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-1.5">
                            <LuInfo className="text-buzz-gold" /> Retrieval
                            Information
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-dashed border-gray-200 rounded-lg p-4">
                            {item.retrievalDescription ||
                                "No specific retrieval instructions left by the finder."}
                        </p>
                    </div>

                    {/* Location Details & Map */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-1.5">
                            <LuMapPin className="text-buzz-gold" /> Location
                            Details
                        </h3>
                        <p className="text-gray-600 mb-3">
                            Found near:{" "}
                            <span className="font-medium text-foreground">
                                {item.locationDescription || "Unknown Location"}
                            </span>
                        </p>

                        {/* Map Container */}
                        <div className="h-90 w-full rounded-lg overflow-hidden border border-foreground/10 flex justify-center items-center bg-foreground/2 text-foreground/70">
                            {/* Assumed item has geographic pin structure similar to lost_item */}
                            {item.locationPin ? (
                                <CenteredMap
                                    width="100%"
                                    height="100%"
                                    pin={item}
                                    disableHover={true}
                                />
                            ) : (
                                <div>No map location selected.</div>
                            )}
                        </div>
                    </div>

                    {/* Mobile submit item note */}
                    {item.status === "unclaimed" && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-white flex sm:hidden flex-col gap-5">
                            <SubmitItemNote
                                itemId={item._id}
                                title="Submit an Item Note"
                                subtitle="Leave notes about this item below."
                                placeholder="Example: I left the item with campus security. It is at the library lost and found now."
                                itemType="Item"
                            />
                        </div>
                    )}

                    {/* Item Notes */}
                    <ItemNotes
                        itemNotes={itemNotes}
                        setItemNotes={setItemNotes}
                        itemType="Item"
                    />
                </div>
            </div>
        </div>
    );
}
