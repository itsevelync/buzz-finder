"use client";

import Image from "next/image";
import { IoSettings } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import NavItem from "./NavItem";
import Link from "next/link";

import { useUser } from "../../context/UserContext";

export default function TopBar() {
    const { user } = useUser();
    const avatarSrc = user?.image ?? "/default-icon.svg";
    const avatarKey = `${user?._id ?? "guest"}-${avatarSrc}`;

    return (
        <div className="flex w-full h-14 justify-between items-center border-b border-b-gray-300 py-3 px-5 bg-white">
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="/buzzfinder-logo.png"
                    alt="BuzzFinder Logo"
                    width={50}
                    height={50}
                    className="w-10"
                />
                <h1 className="text-2xl font-bold">BuzzFinder</h1>
            </Link>

            <div className="flex items-center gap-2">
                <div className="relative group">
                    <Link href="/profile">
                        <Image
                            key={avatarKey}
                            src={avatarSrc}
                            alt={user?.name ?? "User avatar"}
                            width={50}
                            height={50}
                            className="object-cover rounded-full cursor-pointer w-8 h-8 p-0.5 hover:p-0 border-2 border-foreground transition-all duration-200"
                        />
                    </Link>
                    {/* Tooltip */}
                    <span className="tooltip tooltip-bottom">
                        {user?.name ?? "Guest"}
                    </span>
                </div>
                <NavItem
                    name="Settings"
                    href="/settings"
                    icon={IoSettingsOutline}
                    iconFill={IoSettings}
                    direction="bottom"
                />
            </div>
        </div>
    );
}
