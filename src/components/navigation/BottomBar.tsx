import Image from "next/image";
import { auth } from '@/auth';
import { IoSettings } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import NavItem from './NavItem';
import Link from "next/link";
import { navLinks } from "@/config/NavLinks";


export default async function BottomBar() {
    const session = await auth();

    return (
        <div className='flex w-full justify-around items-center border-t border-t-gray-300 p-3 bg-white'>
            {navLinks.map((link) => (
                <NavItem key={link.href} name={link.name} href={link.href} icon={link.icon} iconFill={link.iconFill} direction="top" />
            ))}
        </div>
    );
};
