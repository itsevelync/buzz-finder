"use client";

import { useModal, ModalWidth } from "@/context/ModalContext";

const widthClasses: Record<ModalWidth, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full m-4",
};

export default function Modal() {
    const { isOpen, closeModal, modalContent, maxWidth } = useModal();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
        >
            <div
                className={`${widthClasses[maxWidth]} relative w-full`}
                onClick={(e) => e.stopPropagation()}
            >
                {modalContent}
            </div>
        </div>
    );
};
