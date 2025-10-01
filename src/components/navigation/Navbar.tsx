import Link from 'next/link';
import { FaHome } from "react-icons/fa";
import { FaMap } from "react-icons/fa";
import { IoMdChatboxes } from "react-icons/io";
import { CgDetailsMore } from "react-icons/cg";
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Logout from '../auth/Logout';
import Image from "next/image";
import { IoMdSettings } from "react-icons/io";
import { IoMdAdd } from "react-icons/io";

const Navbar = async () => {
    const session = await auth();
    console.log(session);

    return (
        <div className="flex flex-col justify-between align-middle m-2 gap-20 ">
            <div>
                <Link href="/about" className=' relative group'><CgDetailsMore className={"group"}size={50} /><span className='tooltip'>About</span></Link>
            </div>
            <div className='flex flex-col justify-center align-middle text-center text-3xl font-bold gap-10'>
                <Link href="/dashboard" className=' relative group'><FaHome className={"group"}size={50} /><span className='tooltip'>Dashboard</span></Link>
                <Link href="/map-test" className=' relative group'><FaMap className={"group"}size={50} /><span className='tooltip'>Map</span></Link>
                <Link href="/chat" className=' relative group'><IoMdChatboxes className={"group"}size={50} /><span className='tooltip'>Chat</span></Link>
                <Link href="/logitem" className=' relative group'><IoMdAdd className={"group"}size={50} /><span className='tooltip'>Log Item</span></Link>
            </div>
            <div className="flex flex-col justify-between align-middle  gap-5">
                <div className="flex items-center justify-center relative group">
                    <Image
                        src={session?.user?.image ?? "/default-icon.svg"}
                        alt={session?.user?.name ?? "User avatar"}
                        width={50}
                        height={50}
                        className="rounded-full cursor-pointer"
                    />
                    {/* Tooltip */}
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                   px-2 py-1 rounded-md bg-gray-900 text-white text-sm shadow-lg
                   opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                   transition-all duration-200 ease-out whitespace-nowrap pointer-events-none">
                        {session?.user?.name}
                    </span>
                </div>
                    <Link href="/profile" className=' relative group'><IoMdSettings className={"group"}size={50} /><span className='tooltip'>Account</span></Link>
            </div>

        </div>
    );
};

export default Navbar;
