"use client";

import { useModal } from "@/context/ModalContext";
import { IconType } from "react-icons";
import { LuX } from "react-icons/lu";

interface ConfirmationModalProps {
    title: string;
    icon?: IconType;
    body: string | React.ReactNode;
    confirmLabel?: string;
    confirmingLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    color?: "blue" | "gold";
    loading: boolean;
}

export default function ConfirmationModal({
    title,
    icon: Icon,
    body,
    confirmLabel = "Confirm",
    confirmingLabel = "Confirming...",
    cancelLabel = "Cancel",
    onConfirm,
    color = "blue",
    loading,
}: ConfirmationModalProps) {
    const { closeModal } = useModal();

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <div className="bg-white rounded-lg w-full p-5 shadow-xl space-y-2.5 border border-gray-100">
            <div className="flex justify-between items-start">
                <h2
                    className={`flex items-center gap-3 ${color === "blue" ? "text-buzz-blue" : "text-buzz-gold"} text-2xl font-bold`}
                >
                    {Icon && <Icon />} {title}
                </h2>
                <button
                    onClick={closeModal}
                    className="text-foreground/40 hover:bg-foreground/5 rounded-sm p-1 -mr-2 -mt-2"
                >
                    <LuX className="text-lg" />
                </button>
            </div>
            <div className="text-foreground/75">{body}</div>
            <div className="flex items-center justify-end gap-3 pt-3">
                <button
                    onClick={closeModal}
                    disabled={loading}
                    className="px-4 py-2 border border-foreground/20 rounded-md font-medium text-foreground/70 hover:bg-gray-50 transition"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className={`px-4 py-2 ${color === "blue" ? "bg-buzz-blue hover:brightness-125" : "bg-buzz-gold hover:brightness-110"} text-white rounded-md font-medium transition disabled:opacity-50`}
                >
                    {loading ? confirmingLabel : confirmLabel}
                </button>
            </div>
        </div>
    );
}
