// @/components/dashboard/ItemSelectCard.tsx
import Image from "next/image";
import { LuMapPin, LuCircleCheck } from "react-icons/lu";
import { categories } from "@/constants/Categories";
import mongoose from "mongoose";

type GenericItem = {
    _id: string | mongoose.Types.ObjectId;
    name?: string;
    category: keyof typeof categories;
    locationDescription?: string | null;
    image?: { url?: string | null } | null;
    // Normalizing different naming conventions for dates/users
    date: string | Date;
    user?: { username?: string; name?: string; image?: string | null };
};

type Props = {
    item: GenericItem;
    selected?: boolean;
    onSelect: () => void;
};

export default function ItemSelectCard({
    item,
    selected = false,
    onSelect,
}: Props) {
    const category = categories[item.category] ?? {
        label: "Unknown",
        color: "#6B7280",
    };
    const displayDate = new Date(item.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`relative w-full text-left flex flex-col rounded-lg border transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                selected
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-gray-200"
            }`}
        >
            {selected && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                    <LuCircleCheck className="text-sm" /> Selected
                </div>
            )}
            <div className="flex gap-4 p-3">
                {item.image?.url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <Image
                            src={item.image.url}
                            alt={item.name ?? "Item"}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <div className="flex flex-col gap-2 flex-1 truncate">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.name ?? "Untitled"}
                        </h3>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium w-fit"
                            style={{
                                backgroundColor: category.color + "20",
                                color: category.color,
                            }}
                        >
                            {category.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold text-gray-600">
                            {item.user?.username ||
                                item.user?.name ||
                                "Unknown"}
                        </span>
                        <span>|</span>
                        <span>{displayDate}</span>
                    </div>
                    {item.locationDescription && (
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                            <LuMapPin /> {item.locationDescription}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
