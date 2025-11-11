"use client";

import { IoClose } from "react-icons/io5";
import { IoMdMail } from "react-icons/io";
import { FaPhone } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";

interface ContactInfoModalProps {
    onClose: () => void;
    email: string;
    phone?: string | null;
    instagram?: string | null;
    discord?: string | null;
}

export default function ContactInfoModal({
    onClose,
    email,
    phone,
    instagram,
    discord,
}: ContactInfoModalProps) {
    return (
        <div className="fixed z-100 flex items-center justify-center inset-0 bg-gray-600/50 h-full w-full">
            <div className="p-4 border border-buzz-blue/40 w-full max-w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between text-buzz-blue">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <IoClose
                        className="transition-all p-0.5 cursor-pointer text-2xl rounded hover:bg-buzz-blue/10"
                        onClick={onClose}
                    />
                </div>
                <div className="p-2 flex flex-col gap-1">
                    <p className="flex gap-2 items-center">
                        <IoMdMail />
                        Email: {email}
                    </p>
                    {phone && (
                        <p className="flex gap-2 items-center">
                            <FaPhone />
                            Phone: {phone}
                        </p>
                    )}
                    {instagram && (
                        <p className="flex gap-2 items-center">
                            <FaInstagram />
                            Instagram: {instagram}
                        </p>
                    )}
                    {discord && (
                        <p className="flex gap-2 items-center">
                            <FaDiscord />
                            Discord: {discord}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
