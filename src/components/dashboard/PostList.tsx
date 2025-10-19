import { LostItemPost } from "@/model/LostItemPost";
import LostItemCard from "./LostItemCard";

export default function PostList({
    lostItemPosts,
}: {
    lostItemPosts: LostItemPost[] | undefined;
}) {
    if (!lostItemPosts) {
        return <p>No posts found.</p>;
    }
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-4 p-5">
                {lostItemPosts.map((lostItemPost: LostItemPost) => (
                    <LostItemCard
                        key={lostItemPost._id.toString()}
                        lostItemPost={lostItemPost}
                    />
                ))}
            </div>
        </div>
    );
}
