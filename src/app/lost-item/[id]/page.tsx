import { dbConnect } from "@/lib/mongo";
import { LostItemPost } from "@/model/LostItemPost";
import Link from "next/link";
import { categories } from "@/constants/Categories";
import Image from "next/image";
import { FaChevronLeft, FaCheck, FaShareAlt } from "react-icons/fa";
import EditDeleteBtns from "@/components/dashboard/EditDeleteBtns";
import { auth } from "@/auth";
import CenteredMap from "@/components/maps/CenteredMap";
import { LuBox, LuImageOff, LuMail, LuMapPin } from "react-icons/lu";

async function getLostItem(id: string): Promise<LostItemPost | null> {
    try {
        await dbConnect();
        const res = await fetch(
            `${process.env.NEXTAUTH_URL}/api/lost-item-post/${id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            },
        );

        if (!res.ok) {
            console.error(
                `Failed to fetch item: ${res.status} ${res.statusText}`,
            );
            return null;
        }

        const data = await res.json();
        return data.item;
    } catch (error) {
        console.error("Error fetching item:", error);
        return null;
    }
}

function UserInfo({ lostItemPost }: { lostItemPost: LostItemPost }) {
    return (
        <div className="flex flex-row items-center gap-2 bg-gray-50 border border-gray-100 rounded-full py-1.5 px-3 w-fit">
            <Image
                src={lostItemPost.user?.image ?? "/default-icon.svg"}
                alt="User avatar"
                width={24}
                height={24}
                className="rounded-full"
            />
            <p className="text-xs text-gray-600 font-medium">
                Posted by{" "}
                <span className="font-semibold text-gray-900">
                    {lostItemPost.user?.username ?? "Guest"}
                </span>
            </p>
        </div>
    );
}

export default async function LostItemPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const lost_item = (await getLostItem(id)) as LostItemPost;

    if (!lost_item) {
        return (
            <div className="p-8 text-center max-w-xl m-auto h-full justify-center flex flex-col">
                <h2 className="text-2xl font-bold text-foreground">
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

    // Fallback to createdAt if specific lostDate isn't implemented in the schema yet
    const displayDate = lost_item.lostDate
        ? new Date(lost_item.lostDate)
        : new Date(lost_item.createdAt);
    const formattedLostDate = displayDate.toLocaleDateString(undefined, {
        dateStyle: "long",
    });

    const session = await auth();
    const isOwner =
        session?.user?._id && session?.user?._id === lost_item.user?._id;

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

            {/* Core Title and Badges */}
            <div className="text-center sm:text-left w-full">
                <h1 className="text-3xl font-bold">
                    {lost_item.name ?? "Untitled Missing Item"}
                </h1>
                <p className="text-gray-500 mb-2">{`Lost on ${formattedLostDate}`}</p>

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
                    <UserInfo lostItemPost={lost_item} />
                    <button className="ml-auto flex items-center gap-2 text-sm text-foreground-90 hover:text-foreground hover:bg-foreground/3 border border-foreground/30 rounded px-3 py-1.5 transition">
                        <FaShareAlt /> Share Post
                    </button>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Main Responsive Grid split into 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* LEFT COLUMN */}
                <div className="lg:sticky lg:top-6 flex flex-col gap-4 w-full">
                    {/* Item image */}
                    <div className="w-full h-30 sm:h-50 bg-foreground/3 rounded-lg overflow-hidden relative border border-foreground/10 shadow-inner">
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
                                <p className="text-foreground/80">
                                    No image uploaded
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-5 shadow-md bg-white flex flex-col gap-5">
                        {/* Item status */}
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Status
                            </p>
                            <div>
                                {lost_item.isFound ? (
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-sm text-sm font-semibold">
                                        <FaCheck /> Item Recovered / Found
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 bg-buzz-gold/15 text-buzz-gold border border-buzz-gold px-3 py-1 rounded-sm text-sm font-semibold">
                                        Actively Missing
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Context Actions Block based on Session Ownership */}
                        <div className="flex flex-col gap-2.5 pt-1">
                            {isOwner ? (
                                // Owner Context Actions
                                <div className="space-y-3">
                                    <button className="w-full bg-buzz-blue hover:opacity-90 text-white font-semibold py-2.5 rounded shadow-sm transition text-sm">
                                        Mark as Resolved & Found
                                    </button>
                                    <div className="border-t border-gray-100 flex justify-center">
                                        <EditDeleteBtns
                                            editURL={`/lost-item-post/${lost_item._id}/edit`}
                                            deleteAPIRoute={`/api/lost-item-post/${lost_item._id}`}
                                            redirect="/dashboard?tab=lost"
                                        />
                                    </div>
                                </div>
                            ) : (
                                // External User Context Actions (Use Case 2 Intersections)
                                <>
                                    <button className="w-full bg-buzz-blue hover:opacity-90 text-white font-semibold py-3 rounded shadow-sm transition text-sm flex items-center justify-center gap-2">
                                        I Found This Item!
                                    </button>

                                    <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded transition text-sm flex items-center justify-center gap-2">
                                        <LuMail /> Message Item Owner
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Item Description */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-1.5">
                            <LuBox className="text-buzz-gold" /> Item
                            Description
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
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
                        <div className="h-90 w-full rounded-lg overflow-hidden border border-foreground/10 flex justify-center items-center bg-foreground/3 text-foreground/80 shadow-inner">
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
                </div>
            </div>
        </div>
    );
}
