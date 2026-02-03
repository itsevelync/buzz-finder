import { categories } from "@/constants/Categories";
import { PlainItem } from "@/model/Item";
import Image from "next/image";
import Link from "next/link";
import { FaMapPin } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";

interface FoundItemCardProps {
    item: PlainItem;
    includeMapLink: boolean;
}

export default function FoundItemCard({
    item,
    includeMapLink = true,
}: FoundItemCardProps) {
    const formattedLostDate = new Date(item.lostdate).toLocaleDateString();
    const formattedLostTime = new Date(item.lostdate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    const category = categories[item.category];
    const CategoryIcon = category.icon;

    return (
        <div
            id={item._id.toString()}
            className="transition-all border border-gray-200 bg-white shadow
                       hover:shadow-lg hover:-translate-y-0.5 rounded-xl w-full h-full flex flex-col"
        >
            <Image
                className="w-full h-50 max-h-full rounded-t-xl object-cover"
                src={item.image?.url ?? "/img-placeholder.jpg"}
                alt={`${item.title} Image`}
                height={280}
                width={200}
            />
            <div className="flex-1 p-3 gap-3 justify-between flex flex-col">
                <div>
                    <a href={"/item/" + item._id}>
                        <h2 className="font-bold text-lg hover:underline">
                            {item.title}
                        </h2>
                    </a>
                    <p className="text-sm text-gray-400 mb-1">
                        {`${formattedLostDate}, ${formattedLostTime}`}
                    </p>
                    <p
                        style={{
                            color: category.color,
                            backgroundColor: category.color + "20",
                        }}
                        className="w-fit text-xs rounded-full px-2 py-0.5 mb-3"
                    >
                        {category.label ?? "N/A"}
                    </p>
                    {item.retrieval_description ? (
                        <p>{item.retrieval_description}</p>
                    ) : item.location_details ? (
                        <p>{item.location_details}</p>
                    ) : item.item_description ? (
                        <p>{item.item_description}</p>
                    ) : (
                        <p className="text-sm italic opacity-70">
                            No item details provided.
                        </p>
                    )}
                </div>

                {includeMapLink ? (
                    <a href={"/map?itemId=" + item._id}>
                        <button className="bg-buzz-gold text-white rounded-full px-2 py-1 hover:bg-buzz-gold/80 flex items-center gap-2 w-full justify-center">
                            <FaMapPin /> Locate on Map
                        </button>
                    </a>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            className="flex-1 flex"
                            href={"/item/" + item._id}
                        >
                            <button className="border border-buzz-blue bg-background rounded-full px-2 py-1 flex w-full items-center gap-2 justify-center hover:brightness-95">
                                <CategoryIcon /> Go To Item Page
                            </button>
                        </Link>
                            <button className="border border-buzz-blue bg-background text-xl rounded-full p-2 gap-2 hover:brightness-95">
                                <MdMyLocation />
                            </button>
                    </div>
                )}
            </div>
        </div>
    );
}
