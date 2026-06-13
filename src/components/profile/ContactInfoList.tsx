import { User } from "@/model/User";
import Link from "next/link";
import { FaDiscord, FaInstagram, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { LuMail, LuUser } from "react-icons/lu";

interface ContactInfoListProps {
    user: User;
}

export function ContactInfoList({ user }: ContactInfoListProps) {
    function formatPhoneNumber(phoneNumber: string) {
        if (phoneNumber.length === 11 && phoneNumber.startsWith("1")) {
            const digits = phoneNumber.replace(/\D/g, "");
            return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        } else {
            return `+${phoneNumber}`;
        }
    }

    return (
        <div className="p-1 flex flex-col gap-1">
            <Link
                href={`/user/${user.username}`}
                className="flex gap-2 items-center"
            >
                <LuUser className="text-buzz-blue" /> {user.username}
            </Link>
            <Link
                href={`mailto:${user.email}`}
                target="_blank"
                className="flex gap-2 items-center"
            >
                <LuMail className="text-buzz-blue" /> {user.email}
            </Link>
            {user.phoneNum && (
                <Link
                    href={`tel:+${user.phoneNum}`}
                    target="_blank"
                    className="flex gap-2 items-center"
                >
                    <FaPhoneAlt className="text-buzz-blue" />{" "}
                    {formatPhoneNumber(user.phoneNum)}
                </Link>
            )}
            {user.instagram && (
                <Link
                    href={`https://www.instagram.com/${user.instagram}/`}
                    target="_blank"
                    className="flex gap-2 items-center"
                >
                    <FaInstagram className="text-buzz-blue" /> {user.instagram}
                </Link>
            )}
            {user.discord && (
                <Link
                    href="https://discord.com/app"
                    target="_blank"
                    className="flex gap-2 items-center"
                >
                    <FaDiscord className="text-buzz-blue" /> {user.discord}
                </Link>
            )}
            {user.linkedIn && (
                <Link
                    href={`https://www.linkedin.com/in/${user.linkedIn}/`}
                    target="_blank"
                    className="flex gap-2 items-center"
                >
                    <FaLinkedin className="text-buzz-blue" /> {user.linkedIn}
                </Link>
            )}
        </div>
    );
}
