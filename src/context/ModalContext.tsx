"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ModalWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface ModalOptions {
    maxWidth?: ModalWidth;
}

interface ModalContextType {
    isOpen: boolean;
    openModal: (content: ReactNode, options?: ModalOptions) => void;
    closeModal: () => void;
    modalContent: ReactNode | null;
    maxWidth: ModalWidth;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [maxWidth, setMaxWidth] = useState<ModalWidth>("md");

    function openModal(content: ReactNode, options?: ModalOptions) {
        setModalContent(content);
        setMaxWidth(options?.maxWidth ?? "md");
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
        setModalContent(null);
        setMaxWidth("md");
    }

    return (
        <ModalContext.Provider
            value={{ isOpen, openModal, closeModal, modalContent, maxWidth }}
        >
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
