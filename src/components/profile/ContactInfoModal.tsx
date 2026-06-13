"use client";

import { useModal } from "@/context/ModalContext";
import { LuX } from "react-icons/lu";
import { User } from "@/model/User";
import { ContactInfoList } from "./ContactInfoList";

interface ContactInfoModalProps {
    user: User;
}

export default function ContactInfoModal({ user }: ContactInfoModalProps) {
    const { closeModal } = useModal();

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
            <ContactInfoList user={user} />
        </div>
    );
}
