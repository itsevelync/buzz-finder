"use client";

import { FaPhone } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaDiscord, FaLinkedin } from "react-icons/fa";
import { useModal } from "@/context/ModalContext";
import { LuMail, LuX } from "react-icons/lu";
import Link from "next/link";

interface ContactInfoModalProps {
    email: string;
    phone?: string | null;
    instagram?: string | null;
    discord?: string | null;
    linkedIn?: string | null;
}

export default function ContactInfoModal({
    email,
    phone,
    instagram,
    discord,
    linkedIn,
}: ContactInfoModalProps) {
    const { closeModal } = useModal();

    function formatPhoneNumber(phoneNumber: string) {
        if (phoneNumber.length === 11 && phoneNumber.startsWith("1")) {
            const digits = phoneNumber.replace(/\D/g, "");
            return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        } else {
            return `+${phoneNumber}`;
        }
    }

    return (
        <div className="bg-white rounded-lg w-full p-5 shadow-xl space-y-2.5 border border-gray-100">
            <div className="flex justify-between items-start">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-buzz-blue">
                    Contact Information{" "}
                </h2>
                <button
                    onClick={closeModal}
                    className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                >
                    <LuX className="text-lg" />
                </button>
            </div>
            <div className="p-1 flex flex-col gap-1">
                <Link href={`mailto:${email}`} target="_blank" className="flex gap-2 items-center">
                    <LuMail className="text-buzz-blue" /> {email}
                </Link>
                {phone && (
                    <Link href={`tel:+${phone}`} target="_blank" className="flex gap-2 items-center">
                        <FaPhone className="text-buzz-blue" />{" "}
                        {formatPhoneNumber(phone)}
                    </Link>
                )}
                {instagram && (
                    <Link href={`https://www.instagram.com/${instagram}/`} target="_blank" className="flex gap-2 items-center">
                        <FaInstagram className="text-buzz-blue" /> {instagram}
                    </Link>
                )}
                {discord && (
                    <Link href="https://discord.com/app" target="_blank" className="flex gap-2 items-center">
                        <FaDiscord className="text-buzz-blue" /> {discord}
                    </Link>
                )}
                {linkedIn && (
                    <Link href={`https://www.linkedin.com/in/${linkedIn}/`} target="_blank" className="flex gap-2 items-center">
                        <FaLinkedin className="text-buzz-blue" /> {linkedIn}
                    </Link>
                )}
            </div>
        </div>
    );
}
