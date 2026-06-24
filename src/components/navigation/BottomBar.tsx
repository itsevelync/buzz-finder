"use client";

import { IoAdd } from "react-icons/io5";
import NavItem from "./NavItem";
import { navLinks } from "@/constants/NavLinks";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";

export default function BottomBar() {
    const { user } = useUser();
    const avatarSrc = user?.image ?? "/default-icon.svg";
    const avatarKey = `${user?._id ?? "guest"}-${avatarSrc}`;

    return (
        <div className="flex w-full h-14 justify-around items-center border-t border-t-gray-300 p-3 bg-white">
            {navLinks.slice(0, 2).map((link) => (
                <NavItem
                    key={link.href}
                    name={link.name}
                    href={link.href}
                    icon={link.icon}
                    iconFill={link.iconFill}
                    direction="top"
                />
            ))}
            <Link href="/report-item" className="relative -mt-5 w-16 h-16">
                <button className="flex saturate-150 items-center justify-center w-full h-full bg-buzz-gold rounded-full text-background text-3xl border-5 border-white hover:brightness-110 hover:saturate-120">
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-yellow-300 via-amber-400 to-orange-500 opacity-40" />

                    <IoAdd className="absolute" />
                </button>
                <div className="-z-2 absolute top-0 w-full h-full rounded-full bg-gray-300 outline outline-gray-300"></div>
            </Link>
            {navLinks.slice(3, 4).map((link) => (
                <NavItem
                    key={link.href}
                    name={link.name}
                    href={link.href}
                    icon={link.icon}
                    iconFill={link.iconFill}
                    direction="top"
                />
            ))}
            <div className="flex items-center gap-2">
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
                            className="object-cover rounded-full cursor-pointer w-8 h-8 p-0.5 hover:p-0 border-2 border-foreground transition-all duration-200"
                        />
                    </Link>
                    {/* Tooltip */}
                    <span className="tooltip tooltip-bottom">
                        {user?.name ?? "Guest"}
                    </span>
                </div>
            </div>
        </div>
    );
}
