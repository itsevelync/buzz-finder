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
import { ContactInfoList } from "@/components/profile/ContactInfoList";

interface ItemClientProps {
    id: string;
}

export default function ItemClient({ id }: ItemClientProps) {
    const { user } = useUser();
    const { items } = usePostAndItem();

    if (!items.length) {
        return <div>Loading...</div>;
    }

    const item = items.find((i) => i._id.toString() === id);

    if (!item) {
        return (
            <div className="p-8 text-center max-w-xl m-auto h-full justify-center flex flex-col">
                <h2 className="text-2xl font-bold text-foreground">
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
    const category = categories[item.category];

    const formattedLostDate = new Date(item.lostDate).toLocaleDateString();
    const formattedLostTime = new Date(item.lostDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="p-5 sm:p-8 max-w-6xl m-auto flex flex-col gap-6">
            <Link
                href="/dashboard"
                className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all w-fit"
            >
                <FaChevronLeft /> View all Items
            </Link>
            <div className="flex flex-col sm:flex-row w-full items-center justify-between sm:items-start gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold">{item.name ?? "N/A"}</h1>
                    <p className="text-gray-500 mb-2">{`Found on ${formattedLostDate} at ${formattedLostTime}`}</p>
                    <p
                        style={{
                            color: category.color,
                            backgroundColor: category.color + "20",
                        }}
                        className="w-fit rounded-full px-4 py-1 m-auto sm:m-0 text-sm font-medium"
                    >
                        {category.label ?? "N/A"}
                    </p>
                </div>
                {isOwner && (
                    <EditDeleteBtns
                        editURL={`/item/${item._id}/edit`}
                        deleteAPIRoute={`/api/items/${item._id}`}
                    />
                )}
            </div>
            <div className="flex gap-6 flex-col md:flex-row">
                <div className="w-full items-center md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                    <Image
                        src={item.image?.url ?? "/img-placeholder.jpg"}
                        alt={`${item.name} Image`}
                        className="object-cover rounded-xl border border-gray-200 shadow-xs mb-2"
                        width={280}
                        height={280}
                        priority
                    />

                    {/* Dynamic Client Side Actions Injection */}
                    <ItemStatusActions
                        itemId={item._id.toString()}
                        currentStatus={item.status}
                    />
                </div>
                <div className="flex flex-col gap-10 grow">
                    <div className="h-90 w-full rounded-xl overflow-hidden border border-gray-300 shadow">
                        <CenteredMap
                            width="100%"
                            height="100%"
                            pin={item}
                            disableHover={true}
                        />
                    </div>
                    <div className="w-full flex flex-col gap-4">
                        <h2 className="font-bold text-2xl">Item Details</h2>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Description
                            </h3>
                            <p className="text-gray-700 mt-0.5">
                                {item.description || "N/A"}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Retrieval Information
                            </h3>
                            <p className="text-gray-700 mt-0.5">
                                {item.retrievalDescription || "N/A"}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Location Details
                            </h3>
                            <p className="text-gray-700 mt-0.5">
                                {item.locationDescription || "N/A"}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-buzz-blue">
                                Contact Information
                            </h3>
                            {item.personFound ? (
                                <div className="space-y-1 text-gray-700 mt-0.5">
                                    <ContactInfoList user={item.personFound} />
                                </div>
                            ) : (
                                <p className="text-gray-700 mt-0.5">
                                    {item.contactInfo?.details || "N/A"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
