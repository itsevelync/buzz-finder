import Image from "next/image";
import { auth } from '@/auth';
import { IoSettings } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import NavItem from './NavItem';
import Link from "next/link";
import { navLinks } from "@/constants/NavLinks";


export default async function Navbar() {
    const session = await auth();
    
    return (
        <div className="fixed h-full flex flex-col justify-between items-center p-3 border-r border-r-gray-300 w-15">
            <Link href="/" className="-mr-1">
                <Image
                    src="/buzzfinder-logo.png"
                    alt="BuzzFinder Logo"
                    width={50}
                    height={50}
                    className="w-12"
                />
            </Link>
            <div className='flex flex-col items-center gap-[4vh]'>
                {navLinks.map((link) => (
                    <NavItem key={link.href} name={link.name} href={link.href} icon={link.icon} iconFill={link.iconFill} />
                ))}
            </div>
            <div className="flex flex-col items-center gap-[2vh]">
                <div className="relative group">
                    <Link href="/profile">
                        <Image
                            src={session?.user?.image ?? "/default-icon.svg"}
                            alt={session?.user?.name ?? "User avatar"}
                            width={50}
                            height={50}
                            className="rounded-full cursor-pointer w-8 p-0.5 hover:p-0 border-2 border-black transition-all duration-200"
                        />
                    </Link>
                    {/* Tooltip */}
                    <span className="tooltip tooltip-right">{session?.user?.name ?? "Guest"}</span>
                </div>
                <NavItem name="Settings" href="/settings" icon={IoSettingsOutline} iconFill={IoSettings} />
            </div>

        </div>
    );
};
