import Image from "next/image";
import { LuMapPin, LuCircleCheck } from "react-icons/lu";
import { categories } from "@/constants/Categories";
import { LostItemPost } from "@/model/LostItemPost";
import { PlainItem } from "@/model/Item";

type Props = {
    item: PlainItem;
    selected?: boolean;
    onSelect: () => void;
};

function UserMini({ user }: { user?: LostItemPost["user"] }) {
    return (
        <div className="flex items-center gap-2">
            <Image
                src={user?.image ?? "/default-icon.svg"}
                alt="User avatar"
                width={24}
                height={24}
                className="rounded-full object-cover border border-gray-200"
            />
            <span className="text-xs text-gray-600">
                {user?.username ?? "Unknown"}
            </span>
        </div>
    );
}

export default function FoundItemSelectCard({
    item,
    selected = false,
    onSelect,
}: Props) {
    const category = categories[item.category] ?? {
        label: "Unknown",
        color: "#6B7280",
    };

    const createdDate = new Date(item.lostDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const handleClick = () => {
        onSelect();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`relative w-full text-left flex flex-col rounded-lg border transition-all duration-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                selected
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-gray-200"
            }`}
        >
            {/* SELECTED INDICATOR */}
            {selected && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-1 sm:px-2 py-1 rounded-full text-xs font-medium">
                    <LuCircleCheck className="text-sm" />
                    <span className="hidden sm:inline">Selected</span>
                </div>
            )}

            <div className="flex gap-4 p-3">
                {/* IMAGE */}
                {item.image?.url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <Image
                            src={item.image.url}
                            alt={item.name ?? "Found item"}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* CONTENT */}
                <div className="flex flex-col gap-2 flex-1 truncate">
                    {/* TITLE + CATEGORY */}
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.name ?? "Untitled Item"}
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

                    {/* USER + DATE */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <UserMini user={item.personFound} />
                        <span className="hidden sm:block text-gray-300">|</span>
                        <span className="text-xs text-gray-500">
                            {createdDate}
                        </span>
                    </div>

                    {/* META */}
                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                        {item.locationDescription && (
                            <span className="flex items-center gap-2">
                                <LuMapPin /> {item.locationDescription}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}
