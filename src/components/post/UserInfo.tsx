import { User } from "@/model/User";
import Image from "next/image";

export default function UserInfo({ user }: { user: User | undefined }) {
    return (
        <div className="flex flex-row items-center gap-2 bg-gray-50 border border-gray-100 rounded-full py-1.5 px-3 w-fit">
            <Image
                src={user?.image ?? "/default-icon.svg"}
                alt="User avatar"
                width={24}
                height={24}
                className="rounded-full"
            />
            <p className="text-xs text-gray-600 font-medium">
                Posted by{" "}
                <span className="font-semibold text-gray-900">
                    {user?.username ?? "Guest"}
                </span>
            </p>
        </div>
    );
}