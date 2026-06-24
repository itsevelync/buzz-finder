"use client";

import Image from "next/image";
import { IoSettings } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import NavItem from "./NavItem";
import Link from "next/link";
import NotificationBadge from "./NotificationBadge";
import { useUser } from "@/context/UserContext";

export default function TopBar() {
    const { user } = useUser();

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

            <div className="flex items-center gap-3">
                {user?._id && (
                    <NotificationBadge direction="bottom" size="text-2xl" />
                )}
                <NavItem
                    name="Settings"
                    href="/settings"
                    icon={IoSettingsOutline}
                    iconFill={IoSettings}
                    direction="bottom"
                    size="text-2xl"
                />
            </div>
        </div>
    );
}
