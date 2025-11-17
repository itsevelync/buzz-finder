import { LostItemPost } from "@/model/LostItemPost";
import Image from "next/image";
import React from "react";

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
  const formattedLostDate = new Date(
    lostItemPost.createdAt
  ).toLocaleDateString();
  const formattedLostTime = new Date(lostItemPost.createdAt).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="rounded-lg w-full flex flex-col shadow p-3 gap-4">
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
    </div>
  );
}
