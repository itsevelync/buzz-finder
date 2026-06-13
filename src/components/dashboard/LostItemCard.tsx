import { LostItemPost } from "@/model/LostItemPost";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/constants/Categories";
import { LuBadgeCheck, LuCalendar, LuMapPin } from "react-icons/lu";

function UserMini({ user }: { user?: LostItemPost["user"] }) {
    return (
        <div className="flex items-center gap-2">
            <Image
                src={user?.image ?? "/default-icon.svg"}
                alt="User avatar"
                width={28}
                height={28}
                className="rounded-full object-cover border border-gray-200"
            />
            <span className="text-sm text-gray-600">
                {user?.username ?? "Guest"}
            </span>
        </div>
    );
}

export default function LostItemCard({
    lostItemPost,
    columns = 2,
}: {
    lostItemPost: LostItemPost;
    columns?: number;
}) {
    const category = categories[lostItemPost.category] ?? {
        label: "Unknown",
        color: "#6B7280",
    };

    const createdDate = new Date(lostItemPost.createdAt).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" },
    );

    const lostDate = lostItemPost.lostDate
        ? new Date(lostItemPost.lostDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : null;

    const contact =
        lostItemPost.user?.email ?? lostItemPost.contactInfo?.details ?? "N/A";

    return (
        <Link
            href={`/lost-item/${lostItemPost._id}`}
            className="group flex w-full"
        >
            <div className="relative w-full flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                {/* FOUND BADGE */}
                {lostItemPost.isFound && (
                    <div className={`absolute top-2 right-2 ${columns <= 2 ? "lg:top-4 lg:right-4" : ""} z-1 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full text-xs font-medium`}>
                        <LuBadgeCheck className="text-sm" />
                        Found
                    </div>
                )}

                <div className={`flex flex-1 flex-col ${columns <= 2 ? "lg:flex-row-reverse lg:gap-6" : ""}`}>
                    {/* IMAGE */}
                    {lostItemPost.image?.url && (
                        <div className={`${columns <= 2 ? `${lostItemPost.isFound ? "lg:mx-4 lg:mt-14" : "lg:m-4"} lg:w-28 lg:h-28 lg:rounded-b-lg` : ""} relative w-full h-35 rounded-t-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0`}>
                            <Image
                                src={lostItemPost.image.url}
                                alt={lostItemPost.name ?? "Lost item"}
                                fill
                                className="object-cover group-hover:scale-[1.03] transition-transform duration-200"
                            />
                        </div>
                    )}

                    <div className="w-full">
                        {/* CONTENT */}
                        <div className="flex flex-col w-full gap-2 p-4">
                            <div className="flex flex-col justify-between items-start gap-3">
                                {/* TOP ROW */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {lostItemPost.name ??
                                                "Untitled Item"}
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className="text-sm px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                backgroundColor:
                                                    category.color + "20",
                                                color: category.color,
                                            }}
                                        >
                                            {category.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <UserMini user={lostItemPost.user} />
                                    <span className="text-xl text-gray-300">
                                        |
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {createdDate}
                                    </span>
                                </div>
                            </div>
                            {/* DESCRIPTION */}
                            <p className="text-gray-600 line-clamp-2">
                                {lostItemPost.description ||
                                    "No description provided for this item."}
                            </p>

                            {/* META */}
                            <div className="flex flex-col gap-1 text-sm text-gray-500">
                                {lostDate && (
                                    <span className="flex items-center gap-2">
                                        <LuCalendar /> Lost: {lostDate}
                                    </span>
                                )}
                                {lostItemPost.locationDescription && (
                                    <span className="flex items-center gap-2">
                                        <LuMapPin />{" "}
                                        {lostItemPost.locationDescription}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CONTACT */}
                        <div className="mt-auto pb-4 px-4 text-sm text-gray-400 border-t border-gray-100 pt-3">
                            Contact:{" "}
                            <span className="text-gray-600">{contact}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
