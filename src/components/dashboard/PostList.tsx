import { LostItemPost } from "@/model/LostItemPost";
import LostItemCard from "./LostItemCard";

export default function PostList({
  lostItemPosts,
  columns = 1,
}: {
  lostItemPosts: LostItemPost[] | undefined;
  columns?: number;
}) {
  if (!lostItemPosts) {
    return <p>No posts found.</p>;
  }

  const sortedPosts = [...lostItemPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const gridColsClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    }[columns] || "grid-cols-1";

  return (
    <div className="w-full flex flex-col gap-4">
      <div className={`grid ${gridColsClass} gap-4 p-5 justify-items-center`}>
        {sortedPosts.map((lostItemPost: LostItemPost) => (
          <LostItemCard
            key={lostItemPost._id.toString()}
            lostItemPost={lostItemPost}
          />
        ))}
      </div>
    </div>
  );
}
