import { LostItemPost } from "@/model/LostItemPost";
import { useSession } from "next-auth/react";
import Image from "next/image";

function UserInfo({ lostItemPost }: { lostItemPost: LostItemPost }) {
    return (
        <div className="flex flex-row items-center gap-2">
            <Image
                src={lostItemPost.user?.image ?? "/default-icon.svg"}
                alt="User avatar"
                width={30}
                height={30}
                className="relative overflow-hidden rounded-full"
            />
            <p className="text-xs">{lostItemPost.user?.username ?? "Guest"}</p>
        </div>
    );
}

export default function LostItemCard({
    lostItemPost,
}: {
    lostItemPost: LostItemPost;
}) {
    const session = useSession();

    const formattedLostDate = new Date(
        lostItemPost.createdAt
    ).toLocaleDateString();
    const formattedLostTime = new Date(
        lostItemPost.createdAt
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    async function softDeleteItem({
        lostItemPost,
        session,
    }: {
        lostItemPost: LostItemPost;
        session: ReturnType<typeof useSession>;
    }) {
        if (!(lostItemPost?.user?._id == session.data?.user?._id)) return;

        // const userMarker = (await (await fetch(`/api/users/6913b99673301f7059e12475`)).json());

        await fetch("/api/lost-item-post", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: lostItemPost._id,
                user: null,
            }),
        });
    }

    async function handleDelete() {
        await softDeleteItem({ lostItemPost, session });
    }

    if (lostItemPost.user === null) return;

    return (
        <div className="rounded-lg w-full flex flex-col shadow p-6 gap-4 max-w-[1020px]">
            <div className="flex flex-row items-center gap-2 justify-between flex-wrap">
                <UserInfo lostItemPost={lostItemPost} />
                <p className="text-xs">
                    {formattedLostDate}, {formattedLostTime}
                </p>
            </div>
            <div>
                <a href={"/lost-item/" + lostItemPost._id}>
                    <h2 className="text-xl font-bold hover:underline">
                        {lostItemPost.title}
                    </h2>
                </a>
                <p className="text-sm">{lostItemPost.description}</p>
            </div>
            <p>Contact: {lostItemPost.contactInfo ?? "N/A"}</p>
            <button
                onClick={handleDelete}
                className="bg-buzz-blue text-white px-4 py-2 rounded-md w-fit"
            >
                {" "}
                DELETE ITEM{" "}
            </button>
        </div>
    );
}
