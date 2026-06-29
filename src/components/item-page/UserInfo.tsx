import { User } from "@/model/User";
import Image from "next/image";
import Link from "next/link";

interface UserInfoProps {
    user: User | null | undefined;
    text?: string;
}

export default function UserInfo({ user, text = "Posted by" }: UserInfoProps) {
    const Wrapper = user ? Link : "div";

    return (
        <Wrapper
            href={user ? `/user/${user.username}` : "?"}
            className="flex flex-row items-center gap-2 bg-gray-50 border border-gray-100 rounded-full py-1.5 px-3 w-fit"
        >
            <Image
                src={user?.image ?? "/images/default-icon.svg"}
                alt="User avatar"
                width={24}
                height={24}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
            />
            <p className="text-xs text-gray-600 font-medium">
                {text}{" "}
                <span className="font-semibold text-gray-900">
                    {user?.username ?? "Guest"}
                </span>
            </p>
        </Wrapper>
    );
}
