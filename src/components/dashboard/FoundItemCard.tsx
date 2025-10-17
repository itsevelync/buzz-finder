import { Item } from "@/model/Item";
import React from "react";
import Image from "next/image";

interface FoundItemCardProps {
    item: Item;
    includeMapLink: boolean;
}

export default function FoundItemCard({
    item,
    includeMapLink = true,
}: FoundItemCardProps) {
    const formattedLostDate = new Date(item.lostdate).toLocaleDateString()
    const formattedLostTime = new Date(item.lostdate).toLocaleTimeString()

    return (
        <div id={item._id.toString()} className="transition-all border border-gray-200 bg-white shadow hover:shadow-lg hover:-translate-y-0.5 rounded-xl w-full">
            <Image
                className="w-full h-50 max-h-full rounded-t-xl object-cover"
                src={item.image?.url ?? "/img-placeholder.jpg"}
                alt={`${item.title} Image`}
                height={280}
                width={200}
            />
            <div className="w-full p-3">
                <a href={"item/" + item._id}>
                    <h2 className="font-bold text-lg hover:underline">
                        {item.title}
                    </h2>
                </a>
                <h3>{item.location_details}</h3>
                <p className="text-sm text-gray-400 mb-1">
                    {`${formattedLostDate} ${formattedLostTime}`}
                </p>
                <p>{item.retrieval_description}</p>
                {includeMapLink && (
                    <a href={"map?itemId=" + item._id}>
                        <button className="bg-buzz-gold text-white rounded-md px-2 py-1 hover:bg-buzz-gold/80 mt-3">
                            View on Map
                        </button>
                    </a>
                )}
            </div>
        </div>
    );
}
