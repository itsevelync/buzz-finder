"use client";

import Image from "next/image";
import { IoSettings } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import NavItem from "./NavItem";
import Link from "next/link";
import { navLinks } from "@/constants/NavLinks";

import { useUser } from "../../context/UserContext";
import NotificationBadge from "./NotificationBadge";

export default function Navbar() {
    const { user } = useUser();
    const avatarSrc = user?.image ?? "/default-icon.svg";
    const avatarKey = `${user?._id ?? "guest"}-${avatarSrc}`;

    return (
        <div className="bg-background fixed h-full flex flex-col justify-between items-center p-3 border-r border-r-gray-300 w-15 z-100">
            <Link href="/" className="-mr-1">
                <Image
                    src="/buzzfinder-logo.png"
                    alt="BuzzFinder Logo"
                    width={50}
                    height={50}
                    className="w-12"
                />
            </Link>
            <div className="flex flex-col items-center gap-[4vh]">
                {navLinks.map((link) => (
                    <NavItem
                        key={link.href}
                        name={link.name}
                        href={link.href}
                        icon={link.icon}
                        iconFill={link.iconFill}
                    />
                ))}
                <div className="relative group">
                    <Link
                        href={
                            user?.username ? `/user/${user.username}` : "/login"
                        }
                    >
                        <Image
                            key={avatarKey}
                            src={avatarSrc}
                            alt={user?.name ?? "User avatar"}
                            width={50}
                            height={50}
                            className="object-cover rounded-full cursor-pointer h-8 w-8 p-0.5 hover:p-0 border-2 border-foreground transition-all duration-200"
                        />
                    </Link>
                    {/* Tooltip */}
                    <span className="tooltip tooltip-right">
                        {user?.name ?? "Guest"}
                    </span>
                </div>
            </div>
            <div className="flex flex-col items-center gap-[1.8vh]">
                {user?._id && <NotificationBadge size="text-2xl" />}
                <NavItem
                    name="Settings"
                    href="/settings"
                    icon={IoSettingsOutline}
                    iconFill={IoSettings}
                    size="text-2xl"
                />
            </div>
        </div>
    );
}
