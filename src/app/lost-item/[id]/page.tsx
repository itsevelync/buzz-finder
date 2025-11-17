import { dbConnect } from "@/lib/mongo";
import { LostItemPost } from "@/model/LostItemPost";
import Link from "next/link";
import { categories } from "@/constants/Categories";
import Image from "next/image";
import { FaChevronLeft, FaCheck } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { FaXmark } from "react-icons/fa6";

async function getLostItem(id: string) {
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
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch item: ${res.status} ${res.statusText}`);
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

function MainInfo({ lost_item }: { lost_item: LostItemPost }) {
  const category = categories[lost_item.category];

  const formattedLostDate = new Date(lost_item.createdAt).toLocaleDateString();
  const formattedLostTime = new Date(lost_item.createdAt).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">{lost_item.title ?? "N/A"}</h1>
      <p className="text-gray-500 mb-2">
        {`Last seen: ${formattedLostDate} at ${formattedLostTime}`}
        {lost_item.lastSeen && (
          <>
            <GoDotFill color="gray-500" />
            {lost_item.lastSeen}
          </>
        )}
      </p>
      <p
        style={{
          color: category.color,
          backgroundColor: category.color + "20",
        }}
        className="w-fit rounded-full px-4 py-1 m-auto sm:m-0"
      >
        {category.label ?? "N/A"}
      </p>
    </div>
  );
}

function ItemDetails({ lostItemPost }: { lostItemPost: LostItemPost }) {
  return (
    <div className="rounded-lg flex flex-col shadow p-5 gap-4 max-w-[400px]">
      <p className="font-bold text-l">Item Details</p>
      <div>
        <p className="flex items-center">
          Status:
          {lostItemPost.isFound ? (
            <span className="flex items-center gap-1">
              <FaCheck color="green" /> Found
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <FaXmark color="red" /> Missing
            </span>
          )}
        </p>
        <p>Contact: {lostItemPost.contactInfo ?? "N/A"}</p>
      </div>
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

  return (
    <div className="p-5 sm:p-8 max-w-6xl m-auto flex flex-col gap-6">
      <Link
        href="/dashboard?tab=lost"
        className="flex items-center gap-1 text-buzz-gold hover:brightness-90 transition-all"
      >
        <FaChevronLeft /> View all Items
      </Link>
      <UserInfo lostItemPost={lost_item} />
      <div className="flex flex-row justify-between max-w-[1020px]">
        <MainInfo lost_item={lost_item} />
        <ItemDetails lostItemPost={lost_item} />
      </div>
      <div>
        <h3 className="font-bold text-gray-500">Description</h3>
        <p>{lost_item.description ?? "N/A"}</p>
      </div>
    </div>
  );
}
